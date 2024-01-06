package jp.co.sony.ppog.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jp.co.sony.ppog.commons.CrowdPlusConstants;
import jp.co.sony.ppog.dto.CityDto;
import jp.co.sony.ppog.entity.City;
import jp.co.sony.ppog.mapper.CityMapper;
import jp.co.sony.ppog.service.ICityService;
import jp.co.sony.ppog.utils.Pagination;
import jp.co.sony.ppog.utils.ResultDto;
import jp.co.sony.ppog.utils.SecondBeanUtils;
import jp.co.sony.ppog.utils.SnowflakeUtils;
import jp.co.sony.ppog.utils.StringUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import oracle.jdbc.driver.OracleSQLException;

/**
 * 都市サービス実装クラス
 *
 * @author ArkamaHozota
 * @since 2.33
 */
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Transactional(rollbackFor = OracleSQLException.class)
public class CityServiceImpl implements ICityService {

	/**
	 * 都市マッパー
	 */
	private final CityMapper cityMapper;

	@Override
	public ResultDto<String> check(final String name, final Long districtId) {
		final City city = new City();
		city.setName(name);
		city.setDistrictId(districtId);
		return this.cityMapper.checkDuplicated(city) > 0
				? ResultDto.failed(CrowdPlusConstants.MESSAGE_CITY_NAME_DUPLICATED)
				: ResultDto.successWithoutData();
	}

	@Override
	public Pagination<CityDto> getCitiesByKeyword(final Integer pageNum, final String keyword) {
		final Integer pageSize = CrowdPlusConstants.DEFAULT_PAGE_SIZE;
		final Integer offset = (pageNum - 1) * pageSize;
		String searchStr;
		if (StringUtils.isDigital(keyword)) {
			searchStr = "%".concat(keyword).concat("%");
		} else {
			searchStr = StringUtils.getDetailKeyword(keyword);
		}
		final Long records = this.cityMapper.countByKeyword(searchStr);
		final Integer pageMax = (int) ((records / pageSize) + ((records % pageSize) != 0 ? 1 : 0));
		if (pageNum > pageMax) {
			final List<CityDto> pages = this.cityMapper
					.paginationByKeyword(searchStr, (pageMax - 1) * pageSize, pageSize).stream().map(item -> {
						final CityDto cityDto = new CityDto();
						SecondBeanUtils.copyNullableProperties(item, cityDto);
						cityDto.setDistrictName(item.getDistrict().getName());
						return cityDto;
					}).collect(Collectors.toList());
			return Pagination.of(pages, records, pageMax, pageSize);
		}
		final List<CityDto> pages = this.cityMapper.paginationByKeyword(searchStr, offset, pageSize).stream()
				.map(item -> {
					final CityDto cityDto = new CityDto();
					SecondBeanUtils.copyNullableProperties(item, cityDto);
					cityDto.setDistrictName(item.getDistrict().getName());
					return cityDto;
				}).collect(Collectors.toList());
		return Pagination.of(pages, records, pageNum, pageSize);
	}

	@Override
	public void save(final CityDto cityDto) {
		final City city = new City();
		SecondBeanUtils.copyNullableProperties(cityDto, city);
		city.setId(SnowflakeUtils.snowflakeId());
		city.setDelFlg(CrowdPlusConstants.LOGIC_DELETE_INITIAL);
		this.cityMapper.insertById(city);
	}

	@Override
	public ResultDto<String> update(final CityDto cityDto) {
		final City entity = new City();
		entity.setId(cityDto.getId());
		final City city = this.cityMapper.selectById(entity);
		SecondBeanUtils.copyNullableProperties(city, entity);
		SecondBeanUtils.copyNullableProperties(cityDto, city);
		if (city.equals(entity)) {
			return ResultDto.failed(CrowdPlusConstants.MESSAGE_STRING_NOCHANGE);
		}
		this.cityMapper.updateById(city);
		return ResultDto.successWithoutData();
	}
}
