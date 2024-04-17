import dotenv from "dotenv";
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const port = 3000;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function travel(place) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `
    - 사용자가 입력한 장소에 대한 체크리스트 항목을 생성합니다.
    - 각 항목의 어미는 ~기 또는 명사로 끝나야합니다.
    - 각 항목의 글자 수는 30자 이하로 생성합니다.
    - 응답 형식인 json 형식은 다음과 같습니다.
    {
      "출발 전 준비": ["항공권 예약", "호텔 예약하기", "렌터카 준비하기"],
      "추천 장소": ["성산일출봉 방문", "월정리 해수욕장", "제주민속촌 체험"],
      "추천 음식": ["돼지고기튀김", "갈치조림 먹기", "감귤 먹어보기"],
      "유의사항": ["지나친 음주를 하지 않기", "캠핑은 지정된 곳에서만 하기"]
    }
    입력: ${place}
  `;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

app.get("/travel", async (req, res) => {
  const { place } = req.query;
  const text = await travel(place);
  const data = JSON.parse(text);
  res.json(data);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
