require('dotenv').config();
const Sequelize = require('sequelize');


// Set up sequelize to point to our Neon Postgres Database
let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  });
  
sequelize
.authenticate()
.then(() => {
    console.log('Connection has been established successfully.');
})
.catch((err) => {
    console.log('Unable to connect to the database:', err);
});

// Theme Model
const Theme = sequelize.define('Theme', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING
    }
  },{
    createdAt: false, 
    updatedAt: false, 
    }
);

// Set Model
const Set = sequelize.define('Set', {
    set_num: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    year: {
        type: Sequelize.INTEGER
    },
    num_parts: {
        type: Sequelize.INTEGER
    },
    theme_id: {
        type: Sequelize.INTEGER
    },
    img_url: {
        type: Sequelize.STRING
    }
    },
    {
    createdAt: false, 
    updatedAt: false,
    }
);
Set.belongsTo(Theme, {foreignKey: 'theme_id'})

// Initialization
const initialize = async () => {
    try {
        await sequelize.sync();
        console.log('Database synced successfully.');
    } catch (error) {
        throw new Error(`Database sync error: ${error}`);
    }
};
  
// Retrieve all available sets
const getAllSets = async () => {
    try {
      const sets = await Set.findAll({ include: [Theme] });
      return sets;
    } catch (error) {
      console.error('Error fetching all sets:', error);
      throw new Error('Unable to fetch sets from the database.');
    }
};

// Retrieve a specific set by its number
const getSetByNum = async (setNum) => {
    try {
      const set = await Set.findOne({
        where: { set_num: setNum },
        include: [Theme],
      });
  
      if (!set) {
        throw new Error('Set not found.');
      }
  
      return set;
    } catch (error) {
      console.error('Error fetching set by number:', error);
      throw new Error('Unable to fetch set from the database.');
    }
};
  
// Retrieve all sets matching a specific theme
const getSetsByTheme = async (theme) => {
try {
    const sets = await Set.findAll({
    include: [Theme],
    where: {
        '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`,
        },
    },
    });

    if (sets.length === 0) {
        throw new Error('No sets found for the specified theme.');
    }

    return sets;
} catch (error) {
    console.error('Error fetching sets by theme:', error);
    throw new Error('Unable to fetch sets from the database.');
}
};

// Function to add a new set
const addSet = async (setData) => {
    try {
      await Set.create(setData);
      return Promise.resolve(); 
    } catch (error) {
      return Promise.reject(error.errors[0].message);
    }
  };
  
// Function to get all themes
const getAllThemes = async () => {
    try {
        const themes = await Theme.findAll();
        return Promise.resolve(themes);
    } catch (error) {
        return Promise.reject('Unable to fetch themes from the database.');
    }
};

// Function to edit an existing set
const editSet = async (set_num, setData) => {
    try {
        const result = await Set.update(setData, {
            where: { set_num: set_num },
        });

        if (result[0] === 0) {
            // If no rows were updated, the set with set_num doesn't exist
            throw new Error('Set not found.');
        }

        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error.errors[0].message);
    }
};

// Function to delete an existing set
const deleteSet = async (setNum) => {
    try {
      const result = await Set.destroy({
        where: { set_num: setNum },
      });
  
      if (result === 0) {
        throw new Error(`Set with set_num ${setNum} not found.`);
      }
  
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err.errors[0].message);
    }
};

// Self-invoking function to initialize data
(async () => {
    try {
        await initialize();
        console.log(await getAllSets()); // Logging all sets after initialization
    } catch (error) {
        console.error('Initialization error:', error);
    }
})();
  
module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    addSet, 
    getAllThemes,
    editSet,
    deleteSet
};
