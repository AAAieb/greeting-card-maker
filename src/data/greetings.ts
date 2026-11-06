import type { Occasion } from "../types";

export type Tone = "warm" | "funny" | "formal" | "friendly";
export type Relation = "friend" | "classmate" | "teacher" | "member";

export interface Greeting {
  occasion: Occasion;
  tone: Tone;
  relation: Relation[];
  cn: string;
  en: string;
}

export const OCCASION_LABEL: Record<Occasion, string> = {
  birthday: "生日",
  graduation: "毕业",
  teacher: "感谢老师",
  society: "社团纪念",
};

export const RELATION_LABEL: Record<Relation, string> = {
  friend: "朋友",
  classmate: "同学",
  teacher: "老师",
  member: "社团成员",
};

export const TONE_LABEL: Record<Tone, string> = {
  warm: "温暖",
  funny: "轻松",
  formal: "正式",
  friendly: "友好",
};

export const GREETINGS: Greeting[] = [
  // ---- birthday
  { occasion: "birthday", tone: "warm", relation: ["friend", "classmate"], cn: "愿你今年许的愿望，都不用等太久。", en: "May everything you wished for arrive early this year." },
  { occasion: "birthday", tone: "warm", relation: ["friend"], cn: "又长一岁，但你看上去还是那个会为了小事开心一整天的人。", en: "One year older, still the person who lights up over small things." },
  { occasion: "birthday", tone: "funny", relation: ["classmate", "friend"], cn: "祝你生日快乐，绩点暴涨，头发健在。", en: "Happy birthday. May your GPA rise and your hairline hold." },
  { occasion: "birthday", tone: "funny", relation: ["friend"], cn: "生日蛋糕我请，减肥的事明年再说。", en: "Cake is on me. The diet can wait until next year." },
  { occasion: "birthday", tone: "formal", relation: ["classmate"], cn: "祝你生日快乐，学业顺利，万事胜意。", en: "Wishing you a happy birthday and a successful year ahead." },
  { occasion: "birthday", tone: "friendly", relation: ["friend", "classmate"], cn: "新的一岁，少熬夜，多吃饭。", en: "New year of your life: sleep more, eat properly." },
  { occasion: "birthday", tone: "warm", relation: ["friend"], cn: "认识你是我大学里最不亏的一件事。", en: "Meeting you is the best thing this university gave me." },

  // ---- graduation
  { occasion: "graduation", tone: "warm", relation: ["friend"], cn: "愿你走出校门那天，行李很轻，前程很重。", en: "May your bags be light and your future heavy with promise." },
  { occasion: "graduation", tone: "warm", relation: ["classmate"], cn: "四年过得像一场考试，交卷的时候才发现有点舍不得。", en: "Four years felt like an exam. Handing it in, I found I did not want to." },
  { occasion: "graduation", tone: "formal", relation: ["classmate"], cn: "祝前程似锦，山高水长，后会有期。", en: "Wishing you a bright road ahead. Until we meet again." },
  { occasion: "graduation", tone: "friendly", relation: ["friend", "member"], cn: "以后不在一栋楼了，但饭还是要一起吃的。", en: "We will not share a building anymore, but we still share meals." },
  { occasion: "graduation", tone: "warm", relation: ["friend"], cn: "合照只有一张，但那天笑的人都在。", en: "Only one photo, but everyone who laughed that day is in it." },
  { occasion: "graduation", tone: "funny", relation: ["friend"], cn: "恭喜毕业，从此再也不用抢图书馆的位子。", en: "Congratulations. You never have to fight for a library seat again." },

  // ---- teacher
  { occasion: "teacher", tone: "formal", relation: ["teacher"], cn: "谢谢您在那封推荐信里，替我写了我说不出口的部分。", en: "Thank you for writing, in that reference letter, what I could not say myself." },
  { occasion: "teacher", tone: "formal", relation: ["teacher"], cn: "感谢您一学期的耐心，祝工作顺利，身体康健。", en: "Thank you for your patience this term. Wishing you good health and good work." },
  { occasion: "teacher", tone: "warm", relation: ["teacher"], cn: "这学期问过您很多问题，有些甚至重复了。您每次都重新讲了一遍。", en: "I asked you many questions this term, some of them twice. You explained it again every time." },
  { occasion: "teacher", tone: "warm", relation: ["teacher"], cn: "这门课我会一直记得，不只是因为分数。", en: "I will remember this course, and not because of the grade." },
  { occasion: "teacher", tone: "friendly", relation: ["teacher"], cn: "课程结束了，问题还没问完。以后大概还会来打扰您。", en: "The course is over; my questions are not. I expect I will still bother you." },

  // ---- society
  { occasion: "society", tone: "friendly", relation: ["member"], cn: "从第一次招新摆摊，到最后一次收摊。", en: "From our first recruitment stall to the last one we packed away." },
  { occasion: "society", tone: "warm", relation: ["member"], cn: "这间教室下周就不属于我们了，但这些照片还在。", en: "This room stops being ours next week. These photographs do not." },
  { occasion: "society", tone: "friendly", relation: ["member"], cn: "钥匙在门卫那里，投影仪拍一下就好。", en: "The key is with the porter. Give the projector a smack if it acts up." },
  { occasion: "society", tone: "warm", relation: ["member"], cn: "谢谢你把周五晚上留给了这里。", en: "Thank you for giving your Friday nights to this." },
  { occasion: "society", tone: "formal", relation: ["member"], cn: "感谢每一位成员的付出，祝社团越办越好。", en: "Thank you to every member. May the society keep growing." },
];

export function suggest(occasion: Occasion, relation: Relation, tone: Tone): Greeting[] {
  const byOcc = GREETINGS.filter((g) => g.occasion === occasion);
  const scored = byOcc
    .map((g) => ({
      g,
      score:
        (g.relation.includes(relation) ? 4 : 0) + (g.tone === tone ? 3 : 0),
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((s) => s.g);
}
