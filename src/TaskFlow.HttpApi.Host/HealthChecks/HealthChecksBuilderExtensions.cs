using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.AspNetCore.Mvc;

namespace TaskFlow.HealthChecks;

public static class HealthChecksBuilderExtensions
{
    public static void AddTaskFlowHealthChecks(this IServiceCollection services)
    {
        services.AddHealthChecks().AddCheck<TaskFlowDatabaseCheck>("database", tags: new[] { "ready" });
        services.Configure<AbpEndpointRouterOptions>(options =>
        {
            options.EndpointConfigureActions.Add(context =>
            {
                context.Endpoints.MapHealthChecks("/healthz", new HealthCheckOptions
                {
                    Predicate = _ => false
                }).AllowAnonymous();
                context.Endpoints.MapHealthChecks("/readyz", new HealthCheckOptions
                {
                    Predicate = check => check.Tags.Contains("ready")
                }).AllowAnonymous();
            });
        });
    }
}
