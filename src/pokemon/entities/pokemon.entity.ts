import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Pokemon extends Document {
  @Prop({ required: true, index: true })
  name: string;
  @Prop({ required: true, index: true })
  no: number;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
