const { response } = require('express');
const { off } = require('../database/connections');
const connection = require('../database/connections');

module.exports = {
    async index(request, response) {
        const { page = 1} = request.query;

        const [count] = await connection('incidents').count()
        console.log("🚀 ~ file: IncidentController.js ~ line 9 ~ index ~ count", count)

        const incidents = await connection('incidents')
        .join('ongs','ongs.id','=','incidents.ong_id')
        .limit(5)
        .offset((page - 1) * 5)
        .select([
            'incidents.*',
            'ongs.name',
            'ongs.email',
            'ongs.whatsapp',
            'ongs.city',
            'ongs.uf'
        ]);

    response.header('X-Total-Count', count['count(*)']);

    return response.json(incidents);
    },

    async create(request, response) {
        const { title, description, value } = request.body;
        const ong_id = request.headers.authorization;
        console.log("🚀 ~ file: IncidentController.js ~ line 14 ~ create ~ ong_id", ong_id)

        const [id] = await connection('incidents').insert({
            title,
            description,
            value,
            ong_id,
        });
        return response.json({ id });
    },

    async delete(request, response) {
        const { id } = request.params;
        console.log("🚀 ~ file: IncidentController.js ~ line 26 ~ delete ~ id", id)
        const ong_id = request.headers.authorization;
        console.log("🚀 ~ file: IncidentController.js ~ line 27 ~ delete ~ ong_id", ong_id)

        const incidents = await connection('incidents')
         .where('id', id)
         .select('ong_id') 
         .first();
         console.log("🚀 ~ teste 1")

        if (incidents.ong_id !== ong_id) {
            return response.status(401).json({ error: 'Operation not permitted.'});
        }
        console.log("🚀 ~ teste 2 ")

        await connection('incidents').where('id', id).delete();
        console.log("🚀 ~ teste 3 ")

        return response.status(204).send();
    }
};