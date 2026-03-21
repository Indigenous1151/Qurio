import requests
#Trivia Service can fetch questions from OpenDB API
class TriviaService:
    BASE_URL = "https://opentdb.com/api.php"

    def fetch_questions(self, amount=10, category=None, difficulty=None):
        #default number of questions will be 10 (if not specified by the user)
        params = {
            "amount": amount,
            "type": "multiple"
        }
        if category:
            params["category"]= category
        if difficulty:
            params["difficulty"] = difficulty

        response = requests.get(self.BASE_URL, params=params)
        data = response.json()

        if data["response_code"] == 0:
            return data["results"]
        else:
            raise Exception("Failed to fetch questions from OpenTDB")

