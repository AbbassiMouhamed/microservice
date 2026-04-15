# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY backend/pom.xml backend/pom.xml
COPY backend/discovery-server/pom.xml backend/discovery-server/pom.xml
COPY backend/api-gateway/pom.xml backend/api-gateway/pom.xml
COPY backend/exam-cert-service/pom.xml backend/exam-cert-service/pom.xml

RUN mvn -f backend/exam-cert-service/pom.xml -DskipTests dependency:go-offline

COPY backend/exam-cert-service/src backend/exam-cert-service/src

RUN mvn -f backend/exam-cert-service/pom.xml -DskipTests package


FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /workspace/backend/exam-cert-service/target/*.jar /app/app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
