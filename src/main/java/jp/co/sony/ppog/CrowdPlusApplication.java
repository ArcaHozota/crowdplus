package jp.co.sony.ppog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

import jp.co.sony.ppog.commons.CrowdPlusConstants;
import lombok.extern.log4j.Log4j2;

/**
 * CrowdPlusアプリケーション
 *
 * @author ArkamaHozota
 * @since 1.00beta
 */
@Log4j2
@SpringBootApplication
@ServletComponentScan
public class CrowdPlusApplication {
	public static void main(final String[] args) {
		SpringApplication.run(CrowdPlusApplication.class, args);
		log.info(CrowdPlusConstants.MESSAGE_SPRING_APPLICATION);
	}
}
