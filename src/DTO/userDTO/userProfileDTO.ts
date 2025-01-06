import mongoose from 'mongoose';

export class ResponseUserProfileDto {
    name: string;
    email: string;
    rooms: string[];
    games: string[];
    createdAt: Date;

    constructor(user: any) {
        this.name = user.name;
        this.email = user.email;
        this.rooms = user.rooms?.map((room: mongoose.Types.ObjectId) => room.toString()) || [];
        this.games = user.games?.map((game: mongoose.Types.ObjectId) => game.toString()) || [];
        this.createdAt = user.createdAt;
    }
}
