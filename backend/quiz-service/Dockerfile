FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY backend/pom.xml backend/pom.xml
COPY backend/config-server/pom.xml backend/config-server/pom.xml
COPY backend/discovery-server/pom.xml backend/discovery-server/pom.xml
COPY backend/api-gateway/pom.xml backend/api-gateway/pom.xml
COPY backend/exam-cert-service/pom.xml backend/exam-cert-service/pom.xml
COPY backend/forum-service/pom.xml backend/forum-service/pom.xml
COPY backend/course-resource-service/pom.xml backend/course-resource-service/pom.xml
COPY backend/quiz-service/pom.xml backend/quiz-service/pom.xml
COPY backend/messaging-service/pom.xml backend/messaging-service/pom.xml
COPY backend/adaptive-learning-service/pom.xml backend/adaptive-learning-service/pom.xml

RUN mvn -f backend/pom.xml -N install -q
RUN mvn -f backend/quiz-service/pom.xml -DskipTests dependency:go-offline

COPY backend/quiz-service/src backend/quiz-service/src

RUN mvn -f backend/quiz-service/pom.xml -DskipTests package


FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /workspace/backend/quiz-service/target/*.jar /app/app.jar

EXPOSE 8084
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
