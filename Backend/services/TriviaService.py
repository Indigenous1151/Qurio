import requests
#Trivia Service can fetch questions from OpenDB API
class TriviaService:
    BASE_URL = "https://opentdb.com/api.php"

    CATEGORY_MAPPING = {
        "General Knowledge": 9,
        "Entertainment: Books": 10,
        "Entertainment: Film": 11,
        "Entertainment: Music": 12,
        "Entertainment: Musicals & Theatres": 13,
        "Entertainment: Television": 14,
        "Entertainment: Video Games": 15,
        "Entertainment: Board Games": 16,
        "Science & Nature": 17,
        "Science: Computers": 18,
        "Science: Mathematics": 19,
        "Mythology": 20,
        "Sports": 21,
        "Geography": 22,
        "History": 23,
        "Politics": 24,
        "Art": 25,
        "Celebrities": 26,
        "Animals": 27,
        "Vehicles": 28,
        "Entertainment: Comics": 29,
        "Science: Gadgets": 30,
        "Entertainment: Japanese Anime & Manga": 31,
        "Entertainment: Cartoon & Animations": 32
    }

    def fetch_questions(self, amount=10, category=None, difficulty=None):
        #default number of questions will be 10 (if not specified by the user)
        params = {
            "amount": amount,
            "type": "multiple"
        }
        if category:
            category_id = self.CATEGORY_MAPPING.get(category)
            if category_id:
                params["category"] = category_id
        if difficulty:
            params["difficulty"] = difficulty

        response = requests.get(self.BASE_URL, params=params)
        data = response.json()

        if data["response_code"] == 0:
            return data["results"]
        else:
            raise Exception("Failed to fetch questions from OpenTDB")

