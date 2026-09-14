# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["HospitalManagement.Api.csproj", "./"]
RUN dotnet restore "HospitalManagement.Api.csproj"

# Copy all source files and publish release
COPY . .
RUN dotnet publish "HospitalManagement.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Set production environment and dynamic port
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

# Copy pre-seeded uploads into container runtime directory
COPY uploads ./uploads


EXPOSE 8080

ENTRYPOINT ["dotnet", "HospitalManagement.Api.dll"]
