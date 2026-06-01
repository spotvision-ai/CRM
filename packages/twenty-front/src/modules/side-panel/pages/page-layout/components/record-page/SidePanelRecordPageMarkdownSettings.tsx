import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelGroupFormContainer } from '@/side-panel/components/SidePanelGroupFormContainer';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { TextArea } from '@/ui/input/components/TextArea';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledSidePanelContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

const StyledMarkdownArea = styled.div`
  display: flex;
  flex-direction: column;
  textarea {
    font-family: ui-monospace, 'SFMono-Regular', 'Menlo', monospace;
    min-height: 240px;
  }
`;

export const SidePanelRecordPageMarkdownSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const widgetConfiguration = widgetInEditMode?.configuration;

  const configMarkdown =
    widgetConfiguration && 'markdown' in widgetConfiguration
      ? widgetConfiguration.markdown
      : null;

  const [markdown, setMarkdown] = useState<string>(
    isString(configMarkdown) ? configMarkdown : '',
  );

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const handleMarkdownChange = (value: string) => {
    setMarkdown(value);

    updatePageLayoutWidget(widgetInEditMode.id, {
      configuration: {
        __typename: 'MarkdownConfiguration',
        configurationType: WidgetConfigurationType.MARKDOWN,
        markdown: value.length > 0 ? value : null,
      },
    });
  };

  return (
    <StyledContainer>
      <StyledSidePanelContainer>
        <SidePanelList selectableItemIds={[]}>
          <SidePanelGroup heading={t`Markdown content`}>
            <SidePanelGroupFormContainer>
              <StyledMarkdownArea>
                <TextArea
                  textAreaId={`markdown-settings-${widgetInEditMode.id}`}
                  placeholder={t`# Hello\n\nWrite **markdown** here…`}
                  value={markdown}
                  onChange={handleMarkdownChange}
                  minRows={10}
                  maxRows={30}
                />
              </StyledMarkdownArea>
            </SidePanelGroupFormContainer>
          </SidePanelGroup>
        </SidePanelList>
      </StyledSidePanelContainer>
      <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
    </StyledContainer>
  );
};
