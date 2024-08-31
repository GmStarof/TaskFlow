using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace TaskFlow.Data;

/* This is used if database provider does't define
 * ITaskFlowDbSchemaMigrator implementation.
 */
public class NullTaskFlowDbSchemaMigrator : ITaskFlowDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
