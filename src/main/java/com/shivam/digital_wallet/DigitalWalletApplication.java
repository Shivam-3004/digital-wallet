package com.shivam.digital_wallet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.flywaydb.core.Flyway;
import java.io.InputStream;
import java.util.Properties;

@SpringBootApplication
public class DigitalWalletApplication {

	public static void main(String[] args) {
		// Run Flyway migration before Spring Boot starts to avoid JPA validation issues
		if (!isTestEnvironment()) {
			try {
				System.out.println(">>> RUNNING PRE-START FLYWAY MIGRATION <<<");
				Properties props = new Properties();
				try (InputStream input = DigitalWalletApplication.class.getClassLoader().getResourceAsStream("application.properties")) {
					if (input != null) {
						props.load(input);
					}
				}
				
				String url = props.getProperty("spring.datasource.url", "jdbc:postgresql://localhost:5432/digital-wallet");
				String user = props.getProperty("spring.datasource.username", "postgres");
				String pass = props.getProperty("spring.datasource.password", "shivam884");
				
				// Resolve env vars like ${DB_USERNAME:postgres}
				url = resolveValue(url);
				user = resolveValue(user);
				pass = resolveValue(pass);

				System.out.println("Connecting to datasource: " + url + " as " + user);

				Flyway flyway = Flyway.configure()
						.dataSource(url, user, pass)
						.baselineOnMigrate(true)
						.baselineVersion("1")
						.locations("classpath:db/migration")
						.load();
				flyway.migrate();
				System.out.println(">>> PRE-START FLYWAY MIGRATION SUCCESSFUL <<<");
			} catch (Exception e) {
				System.err.println(">>> PRE-START FLYWAY MIGRATION FAILED: " + e.getMessage());
				e.printStackTrace();
			}
		}

		SpringApplication.run(DigitalWalletApplication.class, args);
	}

	private static boolean isTestEnvironment() {
		// Detect if running under Junit / test phase
		for (StackTraceElement element : Thread.currentThread().getStackTrace()) {
			if (element.getClassName().startsWith("org.junit.") || element.getClassName().startsWith("org.apache.maven.surefire.")) {
				return true;
			}
		}
		// Also check system property
		String activeProfiles = System.getProperty("spring.profiles.active");
		if (activeProfiles != null && activeProfiles.contains("test")) {
			return true;
		}
		return false;
	}

	private static String resolveValue(String value) {
		if (value == null) return null;
		value = value.trim();
		if (value.contains("${")) {
			int start = value.indexOf("${");
			int end = value.indexOf("}", start);
			if (end != -1) {
				String placeholder = value.substring(start, end + 1);
				String inner = value.substring(start + 2, end);
				int colonIndex = inner.indexOf(':');
				String envVarName;
				String defaultValue = "";
				if (colonIndex != -1) {
					envVarName = inner.substring(0, colonIndex);
					defaultValue = inner.substring(colonIndex + 1);
				} else {
					envVarName = inner;
				}
				String envValue = System.getenv(envVarName);
				String resolved = (envValue != null && !envValue.isEmpty()) ? envValue : defaultValue;
				return value.replace(placeholder, resolved);
			}
		}
		return value;
	}
}
