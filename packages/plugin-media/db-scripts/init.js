db = db.getSiblingDB('origami-plugin-media-test');

db.createUser({
    user: "origami",
    pwd: "origami",
    roles: ["readWrite", "dbAdmin"]
});
