from pymongo import MongoClient
from datetime import datetime
from bson.objectid import ObjectId
import bcrypt

import json
from bson import ObjectId


db_config = {
    'host': 'localhost',
    'port': '27017',
    'username': 'todoDBuser',
    'password': 'dbPWD515427',
    'database':'todos',
    'authenticationDatabase': 'todos'
}

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o) # Convert ObjectId to string
        elif isinstance(o, datetime):
            return o.isoformat() # Convert datetime to ISO 8601 format string
        return json.JSONEncoder.default(self, o)

class UseDatabase:
    def __init__(self, config: dict) -> None:
        self.configuration = config
        self.client = None
        self.db = None

    def __enter__(self):
        self.client = MongoClient(
            f"mongodb://{self.configuration['username']}:{self.configuration['password']}@{self.configuration['host']}:{self.configuration['port']}/{self.configuration['database']}?authSource={self.configuration['authenticationDatabase']}"
        )
        self.db = self.client[self.configuration['database']]
        return self.db

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.client.close()

def show_todos(username) -> list:
    with UseDatabase(db_config) as db:
        cursor = db.todos.find({'user': username}).sort("created", -1)
        todos =list(cursor)
        todos_json = json.dumps(todos, cls=JSONEncoder)
        return todos_json

def show_todos_with_tag(username, tag) -> list:
    with UseDatabase(db_config) as db:
        cursor = db.todos.find({
            "$and": [
                {"user": username},
                {"tags": tag}
            ]
        }).sort("created", -1)
        todos = list(cursor)
        todos_json = json.dumps(todos, cls=JSONEncoder)
        return todos_json

def post_todo(username, to_do) -> None:
    with UseDatabase(db_config) as db:
        todo_item = {
            "user": username,
            "todo_text": to_do,
            "created": datetime.now(),
            "done": False,
            "tags": []
        }
        db.todos.insert_one(todo_item)

def make_todo_done(todo_id):
    with UseDatabase(db_config) as db:
        todo_id_object = ObjectId(todo_id) #convert id from string to ObjectId
        result = db.todos.update_one({"_id": todo_id_object}, {"$set": {"done": datetime.now()}})
        if result.modified_count == 1:
            print("Todo marked as done successfully.")
        else:
            print("No todo found with the provided _id.")

def delete_todo(todo_id):
    with UseDatabase(db_config) as db:
        todo_id_object = ObjectId(todo_id)
        result = db.todos.delete_one({"_id": todo_id_object})


def add_tag(tag_string, todo_id):
    with UseDatabase(db_config) as db:
        #convert id from string to ObjectId
        todo_id_object = ObjectId(todo_id)
        # Use $addToSet to add the tag to the tags array only if it does not already exist
        result = db.todos.update_one(
            {"_id": todo_id_object}, 
            {"$addToSet": {"tags": tag_string}}
        )
        
        if result.modified_count == 1:
            print("Tag added successfully.")
        else:
            print("No todo found with the provided _id.")

def clear_tags(todo_id):
    with UseDatabase(db_config) as db:
        todo_id_object = ObjectId(todo_id)
        result = db.todos.update_one({"_id": todo_id_object}, {"$set": {"tags": []}})
        if result.modified_count == 1:
            print("Todo tags cleared.")
        else:
            print("No todo found with the provided _id.")

def add_user(username, email, password):
    if is_username_available(username):
        try:
            with UseDatabase(db_config) as db:
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                user_item = {
                    "username": username,
                    "user_email": email,
                    "user_pwd": hashed_password,
                    "user_created": datetime.now()
                }
                result = db.users.insert_one(user_item)
                if result.acknowledged:
                    message =("User added successfully.")
                else:
                    message =("Failed to add user.")
        except Exception as e:
            print(f"An error occurred: {e}")
    else:
        message =('user already exist')
    return message

def is_username_available(username)->bool:
    try:
        with UseDatabase(db_config) as db:
            # Query the users collection to find a document with the specified username
            user = db.users.find_one({"username": username})
            # If no user is found, the username is available
            if user is None:
                return True
            else:
                return False
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

def validate_user(username, password) -> bool:
    with UseDatabase(db_config) as db:
        # Find the user by username
        user = db.users.find_one({"username": username})
        # Check if the user exists
        if user is None:
            print("User not found.")
            return False
        
        # Retrieve the hashed password from the database
        hashed_password = user['user_pwd']
        
        # Compare the provided password with the hashed password
        if bcrypt.checkpw(password.encode('utf-8'), hashed_password):
            print("Password is correct.")
            return True
        else:
            print("Incorrect password.")
            return False