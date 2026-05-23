namespace ConstructionClientPortal.Api.Dtos;

public sealed record AdminStatsResponse(int ProjectCount, int ClientCount, int TaskCount, int OpenTaskCount, int DocumentCount);
