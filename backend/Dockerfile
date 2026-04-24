FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN wget -O sentry-opentelemetry-agent.jar "https://repo1.maven.org/maven2/io/sentry/sentry-opentelemetry-agent/8.40.0/sentry-opentelemetry-agent-8.40.0.jar"

EXPOSE 8080

ENTRYPOINT ["java", "-javaagent:sentry-opentelemetry-agent.jar", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
