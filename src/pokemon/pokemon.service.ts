import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return this.pokemonModel.find();
  }

  async findOne(_id: string) {
    let pokemon: Pokemon;

    //Not a number
    if (!isNaN(+_id)) pokemon = await this.pokemonModel.findOne({ no: _id });

    //ObjectId
    if (!pokemon && isValidObjectId(_id))
      pokemon = await this.pokemonModel.findById(_id);

    //Name
    if (!pokemon)
      pokemon = await this.pokemonModel.findOne({
        name: _id.toLowerCase().trim(),
      });

    //exist
    if (!pokemon)
      throw new NotFoundException(`Pokemon with id ${_id} not found`);

    return pokemon;
  }

  async update(_id: string, updatePokemonDto: UpdatePokemonDto) {
    let pokemon: Pokemon;

    pokemon = await this.findOne(_id);

    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    try {
      //Con el new:true regresamos el nuevo valor
      await pokemon.updateOne(updatePokemonDto);

      return {
        ok: true,
        message: `Pokemon ${pokemon.name} updated`,
        results: {
          ...pokemon.toJSON(),
          ...updatePokemonDto,
        },
      };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    await this.pokemonModel.findByIdAndRemove(id);

    return {
      ok: true,
      message: `Pokemon deleted`,
    };
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new InternalServerErrorException(
      `Can't create Pokemon - Check server logs`,
    );
  }
}
