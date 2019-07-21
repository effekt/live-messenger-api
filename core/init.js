const bcrypt = require('bcrypt');

checkAndCreateUsersTable = async () => {
    const exists = await pool.query(
        `SELECT EXISTS(
            SELECT * 
            FROM information_schema.tables 
            WHERE 
                table_name = 'users'
        );`
    );
    if (!exists.rows[0].exists) {
        await pool.query(
            `CREATE TABLE users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(80) NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password VARCHAR(140) NOT NULL,
                account_type SMALLSERIAL
            )`,
        );
    }
}

checkAndCreateMessengerTable = async () => {
    const exists = await pool.query(
        `SELECT EXISTS(
            SELECT * 
            FROM information_schema.tables 
            WHERE 
                table_name = 'messenger'
        );`
    );
    if (!exists.rows[0].exists) {
        await pool.query(
            `CREATE TABLE messenger(
                id SERIAL PRIMARY KEY,
                sender_id SERIAL REFERENCES users(id),
                receiver_id SERIAL REFERENCES users(id)
            )`
        );
    }
}

checkAndCreateMessengerMessagesTable = async () => {
    const exists = await pool.query(
        `SELECT EXISTS(
            SELECT * 
            FROM information_schema.tables 
            WHERE 
                table_name = 'messenger_messages'
        );`
    );
    if (!exists.rows[0].exists) {
        await pool.query(
            `CREATE TABLE messenger_messages(
                id SERIAL PRIMARY KEY,
                messenger_id SERIAL REFERENCES messenger(id),
                sender_id SERIAL REFERENCES users(id),
                message TEXT NOT NULL
            )`
        );
    }
}

checkAndCreateUsers = async () => {
    const exists = await pool.query(
        `SELECT id
        FROM users
        WHERE id = 1`
    );
    if (!exists.rows.length) {
        const passHash = await bcrypt.hash('p@ssw0rd', 2);
        await pool.query(
            `INSERT INTO users (name, email, password, account_type)
            VALUES ($1, $2, $3, $4)`,
            ['Jesse', 'educator1@schools.com', passHash, 1]
        );
        await pool.query(
            `INSERT INTO users (name, email, password, account_type)
            VALUES ($1, $2, $3, $4)`,
            ['Jane', 'educator2@schools.com', passHash, 1]
        );
        await pool.query(
            `INSERT INTO users (name, email, password, account_type)
            VALUES ($1, $2, $3, $4)`,
            ['Bob', 'parent@schools.com', passHash, 0]
        );
    }
}

checkAndCreateMessages = async () => {
    const exists = await pool.query(
        `SELECT id
        FROM messenger
        WHERE id = 1`
    );
    if (!exists.rows.length) {
        await pool.query(
            `INSERT INTO messenger (sender_id, receiver_id)
            VALUES ($1, $2)`,
            [1, 3]
        );
        await pool.query(
            `INSERT INTO messenger (sender_id, receiver_id)
            VALUES ($1, $2)`,
            [2, 3]
        );
    }
}

checkAndCreateMessengerMessages = async() => {
    const exists = await pool.query(
        `SELECT id
        FROM messenger_messages
        WHERE id = 1`
    );
    if (!exists.rows.length) {
        await pool.query(
            `INSERT INTO messenger_messages (messenger_id, sender_id, message)
            VALUES ($1, $2, $3)`,
            [1, 1, "I see you're interested in my program!"]
        );
        await pool.query(
            `INSERT INTO messenger_messages (messenger_id, sender_id, message)
            VALUES ($1, $2, $3)`,
            [2, 2, "In response to your interest in my school."]
        );
    }
}



module.exports = async function() {
    try {
        await checkAndCreateUsersTable();
        await checkAndCreateMessengerTable();
        await checkAndCreateMessengerMessagesTable();
        await checkAndCreateUsers();
        await checkAndCreateMessages();
        await checkAndCreateMessengerMessages();
    } catch(err) {
        if (err) console.log(err);
    }
}