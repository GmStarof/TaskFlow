using TaskFlow.Samples;
using Xunit;

namespace TaskFlow.EntityFrameworkCore.Applications;

[Collection(TaskFlowTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<TaskFlowEntityFrameworkCoreTestModule>
{

}
