import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import ReactMarkdown from 'react-markdown';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

const StyledContainer = styled.div`
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.md};
  height: 100%;
  line-height: 1.5;
  overflow: auto;
  padding: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledMarkdown = styled.div`
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: ${themeCssVariables.font.color.primary};
    font-weight: ${themeCssVariables.font.weight.semiBold};
    line-height: 1.25;
    margin: ${themeCssVariables.spacing[3]} 0 ${themeCssVariables.spacing[2]};
  }
  h1 {
    font-size: ${themeCssVariables.font.size.xl};
  }
  h2 {
    font-size: ${themeCssVariables.font.size.lg};
  }
  h3 {
    font-size: ${themeCssVariables.font.size.md};
  }
  p {
    margin: 0 0 ${themeCssVariables.spacing[2]};
  }
  ul,
  ol {
    margin: 0 0 ${themeCssVariables.spacing[2]};
    padding-left: ${themeCssVariables.spacing[5]};
  }
  li {
    margin-bottom: ${themeCssVariables.spacing[1]};
  }
  a {
    color: ${themeCssVariables.color.blue};
    text-decoration: underline;
  }
  code {
    background: ${themeCssVariables.background.tertiary};
    border-radius: ${themeCssVariables.border.radius.sm};
    font-family: ui-monospace, 'SFMono-Regular', 'Menlo', monospace;
    font-size: ${themeCssVariables.font.size.sm};
    padding: 0 ${themeCssVariables.spacing[1]};
  }
  pre {
    background: ${themeCssVariables.background.tertiary};
    border-radius: ${themeCssVariables.border.radius.sm};
    overflow-x: auto;
    padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  }
  pre code {
    background: transparent;
    padding: 0;
  }
  blockquote {
    border-left: 3px solid ${themeCssVariables.border.color.medium};
    color: ${themeCssVariables.font.color.secondary};
    margin: 0 0 ${themeCssVariables.spacing[2]};
    padding-left: ${themeCssVariables.spacing[3]};
  }
  hr {
    border: 0;
    border-top: 1px solid ${themeCssVariables.border.color.light};
    margin: ${themeCssVariables.spacing[3]} 0;
  }
  table {
    border-collapse: collapse;
    margin-bottom: ${themeCssVariables.spacing[2]};
    width: 100%;
  }
  th,
  td {
    border: 1px solid ${themeCssVariables.border.color.light};
    padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
    text-align: left;
  }
  th {
    background: ${themeCssVariables.background.secondary};
    font-weight: ${themeCssVariables.font.weight.semiBold};
  }
`;

const StyledPlaceholder = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-style: italic;
`;

type MarkdownWidgetProps = {
  widget: PageLayoutWidget;
};

export const MarkdownWidget = ({ widget }: MarkdownWidgetProps) => {
  const configuration = widget.configuration;

  const markdown =
    isDefined(configuration) && 'markdown' in configuration
      ? configuration.markdown
      : null;

  return (
    <StyledContainer>
      {isNonEmptyString(markdown) ? (
        <StyledMarkdown>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </StyledMarkdown>
      ) : (
        <StyledPlaceholder>
          {t`No markdown content. Click the widget settings to add some.`}
        </StyledPlaceholder>
      )}
    </StyledContainer>
  );
};
