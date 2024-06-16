import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function travel({
  place,
  travelStyle,
  interests,
  budget,
  duration,
  transportation,
  accommodation,
  companions,
  specialNeeds,
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `
    # 목표
    - 입력 정보를 바탕으로 개인화된 여행 체크리스트 항목을 생성하라.

    # 조건
    - 각 항목의 어미는 ~기 또는 명사로 끝나야 한다.
    - 각 항목의 글자 수는 30자 이하로 생성하라.
    - 각 항목은 모두 한글로 작성하라.

    # 입력 정보
    - 여행 스타일: ${travelStyle}
    - 주요 관심사: ${interests}
    - 예산: ${budget}
    - 여행 기간: ${duration}
    - 방문할 장소: ${place}
    - 선호 교통 수단: ${transportation}
    - 숙소 유형: ${accommodation}
    - 여행 동반자: ${companions}
    - 특별히 필요한 항목이나 서비스: ${specialNeeds}

    # 응답 형식
    - 응답 형식은 json 형식이어야 한다.

    # 요청 및 응답 예시
    ## 예시 1
    ### 입력
    - 여행 스타일: 모험
    - 주요 관심사: 자연
    - 예산: 저예산
    - 방문할 장소: 아이슬란드
    - 여행 동반자: 친구
    ### 응답
    {
      "출발 전 준비": ["배낭 챙기기", "항공권 예약"],
      "가볼 장소": ["빙하 하이킹", "폭포 방문", "화산 탐험"],
      "유의사항": ["방수 옷 준비", "따뜻한 옷 챙기기"]
    }
    
    ## 예시 2
    ### 입력
    - 여행 스타일: 휴양
    - 예산: 고급
    - 여행 기간: 1주일
    - 방문할 장소: 몰디브
    - 숙소 유형: 리조트
    ### 응답
    {
      "출발 전 준비": ["리조트 예약", "휴양지 지도 준비", "스파 예약하기"],
      "가볼 장소": ["해변 방문", "온천 체험", "리조트 내 액티비티"],
      "먹을 음식": ["해산물 요리", "현지 과일 맛보기", "뷔페 즐기기"],
      "유의사항": ["자외선 차단제 챙기기", "수영복 준비", "휴식 시간 확보"]
    }    

    ## 예시 3
    ### 입력
    - 여행 스타일: 문화 탐방
    - 주요 관심사: 역사
    - 방문할 장소: 로마
    - 선호 교통 수단: 도보
    ### 응답
    {
      "출발 전 준비": ["박물관 티켓 예약", "현지 지도 준비"],
      "가볼 장소": ["콜로세움 방문", "바티칸 투어", "트레비 분수"],
      "유의사항": ["편한 신발 준비", "수분 보충하기"]
    }    

    ## 예시 4
    ### 입력
    - 여행 스타일: 가족 여행
    - 주요 관심사: 음식
    - 여행 기간: 2주일
    - 방문할 장소: 도쿄
    - 여행 동반자: 가족
    ### 응답
    {
      "출발 전 준비": ["가족 여행 보험 가입", "식당 예약"],
      "가볼 장소": ["츠키지 시장", "아사쿠사", "도쿄 디즈니랜드"],
      "먹을 음식": ["스시 맛보기", "라멘 먹기", "타코야키 즐기기"]
    }
    

    ## 예시 5
    ### 입력
    - 여행 스타일: 휴양
    - 주요 관심사: 예술
    - 예산: 중간
    - 방문할 장소: 파리
    - 선호 교통 수단: 대중교통
    ### 응답
    {
      "출발 전 준비": ["미술관 티켓 구매", "공항 교통편 예약"],
      "가볼 장소": ["루브르 박물관", "오르세 미술관", "몽마르트르"],
      "먹을 음식": ["크루아상 먹기", "프랑스 와인 시음"],
      "유의사항": ["교통카드 준비", "언어 책자 준비"]
    }    
  `;
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  console.log(text);
  return text;
}

app.use(cors({ origin: "http://localhost:8080" }));

app.get("/travel", async (req, res) => {
  const {
    place,
    travelStyle,
    interests,
    budget,
    duration,
    transportation,
    accommodation,
    companions,
    specialNeeds,
  } = req.query;

  if (!place) {
    return res.status(400).json({ error: "Missing 'place' parameter" });
  }

  const userPreferences = {
    place,
    travelStyle,
    interests,
    budget,
    duration,
    transportation,
    accommodation,
    companions,
    specialNeeds,
  };

  try {
    const text = await travel(userPreferences);
    const jsonStartIndex = text.indexOf("{");
    const jsonEndIndex = text.lastIndexOf("}") + 1;
    const jsonString = text.slice(jsonStartIndex, jsonEndIndex);
    const data = JSON.parse(jsonString);
    res.json(data);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    res.status(400).json({
      error: "Invalid response. Please check the input parameters.",
    });
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
