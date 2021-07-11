import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
// import { RolesGuard } from '../_guards/roles.guard';
// import { Roles } from '../_decorators/roles.decorator';
// import { Role } from '@interfaces/role.enum';
import { TransmittalService } from './transmittal.service';

@Controller('api/transmittals')
export class TransmittalController {
    constructor(private transmittalService: TransmittalService) {}

    @Get()
    // @UseGuards(RolesGuard)
    // @Roles(Role.Outsource)
    async getAll() {
        return this.transmittalService.getAll().then((transmittals) => {
            return transmittals;
        });
    }

    @Get('/:id')
    // @UseGuards(RolesGuard)
    // @Roles(Role.Admin)
    async getById(@Param() param) {
        return this.transmittalService.getById(param.id).then((transmittal) => {
            return transmittal;
        });
    }

    @Post()
    async create(@Body() body) {
        return this.transmittalService.createOne(body).then( transmittal => {
            return transmittal;
        })
    }

    @Put('/:id')
    async update(@Param() param, @Body() body) {
        return this.transmittalService.updateOne(param.id, body).then( transmittal => {
            return transmittal;
        })
    }

    @Delete('/:id')
    async deleteOne(@Param() param) {
        return this.transmittalService.deleteOne(param.id).then( transmittal => {
            return transmittal;
        })
    }
}
