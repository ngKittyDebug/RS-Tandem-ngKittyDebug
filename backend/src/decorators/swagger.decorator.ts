import { applyDecorators, type Type } from '@nestjs/common';
import {
  ApiBody,
  type ApiBodyOptions,
  ApiOperation,
  type ApiOperationOptions,
  ApiResponse,
  type ApiResponseOptions,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiQuery,
  type ApiQueryOptions,
  ApiParam,
  type ApiParamOptions,
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiExtraModels,
} from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

interface ApiResponseNoStatusCustomOptions extends Omit<
  ApiResponseOptions,
  'status'
> {
  schema?: SchemaObject;
}

export interface ApiSwaggerConfig {
  operation: ApiOperationOptions;
  body?: ApiBodyOptions;
  queries?: ApiQueryOptions[];
  params?: ApiParamOptions[];
  responses?: ApiResponseOptions[];
  okResponse?: ApiResponseNoStatusCustomOptions;
  createdResponse?: ApiResponseNoStatusCustomOptions;
  bearerAuth?: boolean;
  exclude?: boolean;
  extraModels?: Type<unknown>[];
}

function ApiSwagger(config: ApiSwaggerConfig) {
  const decorators: Array<PropertyDecorator | MethodDecorator> = [];
  const {
    operation,
    body,
    queries,
    params,
    responses,
    okResponse,
    createdResponse,
    bearerAuth,
    exclude,
    extraModels,
  } = config;

  decorators.push(ApiOperation(operation));

  if (body) {
    decorators.push(ApiBody(body));
  }

  if (queries?.length) {
    queries.forEach((query) => {
      decorators.push(ApiQuery(query));
    });
  }

  if (params?.length) {
    params.forEach((param) => {
      decorators.push(ApiParam(param));
    });
  }

  if (responses?.length) {
    responses.forEach((response) => {
      decorators.push(ApiResponse(response));
    });
  }

  if (okResponse) {
    decorators.push(ApiOkResponse(okResponse));
  }

  if (createdResponse) {
    decorators.push(ApiCreatedResponse(createdResponse));
  }

  if (bearerAuth) {
    decorators.push(ApiBearerAuth());
  }

  if (exclude) {
    decorators.push(ApiExcludeEndpoint());
  }

  if (extraModels?.length) {
    decorators.push(ApiExtraModels(...extraModels));
  }

  return applyDecorators(...decorators);
}

const ApiAuth = () => applyDecorators(ApiBearerAuth());

export { ApiSwagger, ApiAuth };
