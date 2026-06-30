package com.giftgallery.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

@SpringBootApplication(excludeName = {"org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration"})
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
