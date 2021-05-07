import {
    Body,
    Controller, Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post, Put,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import {Role} from "@interfaces/role.enum";
import {Roles} from "../_decorators/roles.decorator";
import {BimCatsService} from "./bim-cats.service";
import {JoiValidationPipe} from "../_pipes/joi-validation.pipe";
import * as Validation from './dto/bimCatVadlidation'
import { BimCatDto } from "./dto";
import {RolesGuard} from "../_guards/roles.guard";

@Controller('api/bimcats')
export class BimCatsController {

    constructor( private bimCatsService: BimCatsService) {
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(Role.Manager, Role.Admin)
    async getAll() {
        return this.bimCatsService.getAll()
            .then(bimCats => {
                return bimCats
            })
    }

    @Get('id/:id')
    @UseGuards(RolesGuard)
    @Roles(Role.Manager, Role.Admin)
    @UsePipes( new JoiValidationPipe(Validation.id))
    async getById(@Req() req) {
        return this.bimCatsService.getById(req.params.id)
            .then(bimCats => {
                return bimCats
            })
    }

    @Get('available')
    async getAvailable( @Req() req ) {
        return this.bimCatsService.getAvailable( req.user.id )
            .then(bimCats => {
                return bimCats
            })
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.Manager, Role.Admin)
    @UsePipes( new JoiValidationPipe(Validation.create))
    async create( @Body() body: BimCatDto ) {
        return this.bimCatsService.create( body )
            .then(bimCat => {
                return bimCat
            })
    }

    @Put('id/:id')
    @UseGuards(RolesGuard)
    @Roles(Role.Manager, Role.Admin)
    @UsePipes( new JoiValidationPipe(Validation.update))
    async update( @Body() body: BimCatDto, @Req() req ) {
        return this.bimCatsService.update( req.params.id, body )
            .then(bimCat => {
                return bimCat
            })
    }

    @Delete('id/:id')
    @UseGuards(RolesGuard)
    @Roles(Role.Manager, Role.Admin)
    async delete( @Param() param) {
        return this.bimCatsService.delete(param.id)
            .then( () => {
                return {message: 'Категория удалена.'}
        })
    }

}
