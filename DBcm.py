import mariadb


class UseDatabase:
    
    def __init__(self, config: dict) -> None:
        self.configuration = config
        
    def __enter__(self) -> 'cursor':
        self.conn = mariadb.connect(**self.configuration)
        self.cursor = self.conn.cursor()
        return self.cursor
        
#if somethig goes wrong, this three args are always given to the _exit_ by Interpreter        
    def __exit__(self, exc_type, exc_value, exc_trace) -> None:
        self.conn.commit()
        self.cursor.close()
        self.conn.close()
        
