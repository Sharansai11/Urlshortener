FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml .
COPY create-service/pom.xml create-service/pom.xml
COPY redirect-service/pom.xml redirect-service/pom.xml

COPY redirect-service/src redirect-service/src

RUN mvn -pl redirect-service -am -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/redirect-service/target/redirect-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
CMD ["sh","-c","java ${JAVA_OPTS} -jar /app/app.jar"]