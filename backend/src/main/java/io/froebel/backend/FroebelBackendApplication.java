package io.froebel.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {
    org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration.class
})
@EnableScheduling
public class FroebelBackendApplication {

    static void main(String[] args) {
        SpringApplication.run(FroebelBackendApplication.class, args);
    }

}
