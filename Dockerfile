# syntax=docker/dockerfile:1.7
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /workspace
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN --mount=type=cache,target=/root/.m2 ./mvnw -B -q dependency:go-offline
COPY src src
RUN --mount=type=cache,target=/root/.m2 ./mvnw -B -DskipTests package \
 && mv target/prose-*.jar /workspace/app.jar

FROM eclipse-temurin:21-jre-jammy
RUN useradd -r -u 1001 -g root prose
WORKDIR /app
COPY --from=build /workspace/app.jar /app/app.jar
USER 1001
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:InitialRAMPercentage=50"
ENTRYPOINT ["java","-jar","/app/app.jar"]
