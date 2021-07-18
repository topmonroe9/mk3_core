import { Injectable, NestMiddleware, Inject } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

// import { Request, Response, NextFunction } from 'express';
@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {
  }

  use(request, response, next): void {
    const { baseUrl, method } = request;
    const reqIP = request.headers["x-forwarded-for"] || request.connection.remoteAddress;
    const userAgent = request.get("user-agent") || "undefined useragent";
    response.on("finish", () => {
	console.log(reqIP);
      const { statusCode } = response;
      const date = this.toIsoString(new Date);
      this.logger.info(`${date} - ${method} ${baseUrl} FROM: ${reqIP} ${userAgent} - ${statusCode}`);
    });

    next();
  }

  private toIsoString(date: Date) {
    var tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? "+" : "-",
      pad = function(num) {
        var norm = Math.floor(Math.abs(num));
        return (norm < 10 ? "0" : "") + norm;
      };

    return date.getFullYear() +
      "-" + pad(date.getMonth() + 1) +
      "-" + pad(date.getDate()) +
      "T" + pad(date.getHours()) +
      ":" + pad(date.getMinutes()) +
      ":" + pad(date.getSeconds()) +
      dif + pad(tzo / 60) +
      ":" + pad(tzo % 60);
  }

}
