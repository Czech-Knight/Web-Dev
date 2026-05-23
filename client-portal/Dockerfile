FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY src/ConstructionClientPortal.Api/ConstructionClientPortal.Api.csproj src/ConstructionClientPortal.Api/
RUN dotnet restore src/ConstructionClientPortal.Api/ConstructionClientPortal.Api.csproj
COPY src/ConstructionClientPortal.Api/ src/ConstructionClientPortal.Api/
RUN dotnet publish src/ConstructionClientPortal.Api/ConstructionClientPortal.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
RUN mkdir -p /app/uploads
EXPOSE 8080
ENTRYPOINT ["dotnet", "ConstructionClientPortal.Api.dll"]
