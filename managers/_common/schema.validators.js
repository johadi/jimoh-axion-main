const mongoose = require('mongoose');

module.exports = {
    'username': (data)=>{
        if(data.trim().length < 3){
            return false;
        }
        return true;
    },
    'objectId': (data)=>{
        return mongoose.Types.ObjectId.isValid(data);
    },

    'numberString': (data) => {
        if (typeof data === 'number' && Number.isInteger(data)) {
            return true;
        }

        return typeof data === 'string' && /^[0-9]+$/.test(data);


    }
}