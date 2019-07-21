const getChats = async (user, cb) => {
    const chats = await pool.query(
        `SELECT *
        FROM messenger
        WHERE
            sender_id = ${user.id}
        OR
            receiver_id = ${user.id}`
    );
    cb(chats.rows);
}

const getChat = async (chat, cb) => {
    const chats = await pool.query(
        `SELECT *
        FROM messenger_messages
        WHERE
            messenger_id = ${chat.id}`
    );
    cb(chats.rows);
}

const addMessage = async (message, cb) => {
    const m = await pool.query(
        `INSERT INTO messenger_messages (messenger_id, sender_id, message)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [message.chat.id, message.user.id, message.message]
    );
    cb(m.rows[0]);
}

module.exports = {
    getChats,
    getChat,
    addMessage
}