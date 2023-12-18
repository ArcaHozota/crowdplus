package jp.co.sony.ppog.listener;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jp.co.sony.ppog.commons.CrowdPlusConstants;
import jp.co.sony.ppog.dto.SecurityAdmin;
import jp.co.sony.ppog.entity.Employee;
import jp.co.sony.ppog.entity.EmployeeRole;
import jp.co.sony.ppog.entity.Role;
import jp.co.sony.ppog.entity.RoleAuth;
import jp.co.sony.ppog.mapper.AuthorityMapper;
import jp.co.sony.ppog.mapper.EmployeeMapper;
import jp.co.sony.ppog.mapper.EmployeeRoleMapper;
import jp.co.sony.ppog.mapper.RoleMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import oracle.jdbc.driver.OracleSQLException;

/**
 * ログインコントローラ(SpringSecurity関連)
 *
 * @author ArkamaHozota
 * @since 1.00beta
 */
@Component
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Transactional(rollbackFor = OracleSQLException.class)
public class CrowdPlusUserDetailsService implements UserDetailsService {

	/**
	 * 権限マッパー
	 */
	private final AuthorityMapper authorityMapper;

	/**
	 * 社員管理マッパー
	 */
	private final EmployeeMapper employeeMapper;

	/**
	 * 社員役割連携マッパー
	 */
	private final EmployeeRoleMapper employeeRoleMapper;

	/**
	 * 役割マッパー
	 */
	private final RoleMapper roleMapper;

	@Override
	public UserDetails loadUserByUsername(final String username) throws UsernameNotFoundException {
		final Employee employee = this.employeeMapper.selectByLoginAcct(username);
		if (employee == null) {
			throw new BadCredentialsException(CrowdPlusConstants.MESSAGE_SPRINGSECURITY_LOGINERROR1);
		}
		final EmployeeRole employeeRole = this.employeeRoleMapper.selectById(employee.getId());
		if (employeeRole == null) {
			throw new DisabledException(CrowdPlusConstants.MESSAGE_SPRINGSECURITY_LOGINERROR2);
		}
		final Role role = this.roleMapper.selectByIdWithAuth(employeeRole.getRoleId());
		if (role.getRoleAuths().isEmpty()) {
			throw new InsufficientAuthenticationException(CrowdPlusConstants.MESSAGE_SPRINGSECURITY_LOGINERROR3);
		}
		final List<Long> authIds = role.getRoleAuths().stream().map(RoleAuth::getAuthId).collect(Collectors.toList());
		final List<GrantedAuthority> authorities = this.authorityMapper.selectByIds(authIds).stream()
				.map(item -> new SimpleGrantedAuthority(item.getName())).collect(Collectors.toList());
		return new SecurityAdmin(employee, authorities);
	}

}
