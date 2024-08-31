using Microsoft.Extensions.Localization;
using TaskFlow.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace TaskFlow;

[Dependency(ReplaceServices = true)]
public class TaskFlowBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<TaskFlowResource> _localizer;

    public TaskFlowBrandingProvider(IStringLocalizer<TaskFlowResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
