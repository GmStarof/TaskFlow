using TaskFlow.Samples;
using Xunit;

namespace TaskFlow.EntityFrameworkCore.Domains;

[Collection(TaskFlowTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<TaskFlowEntityFrameworkCoreTestModule>
{

}
