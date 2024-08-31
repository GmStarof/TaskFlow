using TaskFlow.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace TaskFlow.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(TaskFlowEntityFrameworkCoreModule),
    typeof(TaskFlowApplicationContractsModule)
)]
public class TaskFlowDbMigratorModule : AbpModule
{
}
