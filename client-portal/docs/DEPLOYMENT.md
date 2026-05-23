# Deployment Notes

## IIS Deployment

1. Install the .NET 8 Hosting Bundle on the Windows Server.
2. Publish the API:

```bash
cd src/ConstructionClientPortal.Api
dotnet publish -c Release -o ./publish
```

3. Create an IIS site pointing to the `publish` folder.
4. Set the application pool to **No Managed Code**.
5. Configure environment variables:

```text
ASPNETCORE_ENVIRONMENT=Production
MongoDb__ConnectionString=<production-mongodb-connection-string>
MongoDb__DatabaseName=buildtrack_portal
Jwt__Issuer=BuildTrackPortal
Jwt__Audience=BuildTrackPortalUsers
Jwt__Key=<long-random-production-secret>
```

6. Give the IIS application pool identity write access to the `uploads` folder.
7. Enable HTTPS with a valid certificate.
8. Restart the IIS site.

## AWS EC2 Deployment

A simple AWS path is to use one EC2 instance for the .NET API and MongoDB for a portfolio deployment. For a stronger production setup, use a managed MongoDB provider and keep the database outside the web server.

Basic EC2 flow:

1. Create an Ubuntu EC2 instance.
2. Install Docker and Docker Compose.
3. Clone the repository.
4. Update environment values.
5. Run:

```bash
docker compose --profile app up --build -d
```

6. Open inbound port 80 or 443 through the EC2 security group.
7. Use Nginx as a reverse proxy from port 80/443 to port 8080.
8. Add TLS using Certbot.

## Production Hardening Checklist

- Replace seeded demo credentials.
- Use a long JWT secret from a password manager.
- Use HTTPS only.
- Store MongoDB credentials securely.
- Add file type and file size restrictions based on client requirements.
- Add malware scanning before accepting sensitive documents.
- Enable structured logging and backup policies.
- Keep uploaded files outside the public web root.
- Restrict admin account creation.
