using TaskFlow.Localization;
using Volo.Abp.Application.Services;

namespace TaskFlow;

/* Inherit your application services from this class.
 */
public abstract class TaskFlowAppService : ApplicationService
{
    protected TaskFlowAppService()
    {
        LocalizationResource = typeof(TaskFlowResource);
    }
}
