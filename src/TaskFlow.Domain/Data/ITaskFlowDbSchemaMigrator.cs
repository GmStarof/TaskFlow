using System.Threading.Tasks;

namespace TaskFlow.Data;

public interface ITaskFlowDbSchemaMigrator
{
    Task MigrateAsync();
}
