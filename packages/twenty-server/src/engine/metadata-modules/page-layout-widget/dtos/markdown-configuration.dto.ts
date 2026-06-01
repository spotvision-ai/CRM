import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { type MarkdownConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('MarkdownConfiguration')
export class MarkdownConfigurationDTO implements MarkdownConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.MARKDOWN])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.MARKDOWN;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  markdown?: string | null;
}
