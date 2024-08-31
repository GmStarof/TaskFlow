using TaskFlow.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace TaskFlow.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class TaskFlowController : AbpControllerBase
{
    protected TaskFlowController()
    {
        LocalizationResource = typeof(TaskFlowResource);
    }
}
