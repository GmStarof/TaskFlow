using Xunit;

namespace TaskFlow.EntityFrameworkCore;

[CollectionDefinition(TaskFlowTestConsts.CollectionDefinitionName)]
public class TaskFlowEntityFrameworkCoreCollection : ICollectionFixture<TaskFlowEntityFrameworkCoreFixture>
{

}
