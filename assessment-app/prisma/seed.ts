// 시드: 진단 1 — 동기·성격·강점·드레일먼트 통합 진단 (자가)
//
// ⚠️ 문항/해설은 개발용 초안입니다. 운영 전 타피루즈그룹의 검증된 문항·해설로 교체하세요.
// 교체 방법: 이 파일의 GROUPS 데이터만 수정 후 `npm run db:seed` 재실행 (기존 응답은 유지,
// 단 동일 slug의 진단 정의는 삭제 후 재생성되므로 운영 중 재시드 시 주의).

import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { BAND_THRESHOLDS, DEFAULT_SCALE_LABELS } from '../src/lib/constants'

const SLUG = 'core-profile'

interface BandSeed {
  label: string
  summary: string
}

interface DimensionSeed {
  key: string
  name: string
  description: string
  isRisk?: boolean
  items: { text: string; reversed?: boolean }[]
  bands: { low: BandSeed; mid: BandSeed; high: BandSeed }
}

interface GroupSeed {
  group: string
  dimensions: DimensionSeed[]
}

const GROUPS: GroupSeed[] = [
  {
    group: '동기',
    dimensions: [
      {
        key: 'ACHIEVEMENT',
        name: '성취동기',
        description: '도전적인 목표를 세우고 달성하는 과정에서 에너지를 얻는 정도',
        items: [
          { text: '남들이 어렵다고 하는 목표일수록 오히려 의욕이 생긴다' },
          { text: "결과물이 '탁월한 수준'인지가 나에게 매우 중요하다" },
          { text: '목표를 달성하고 나면 곧 더 높은 기준의 목표를 찾는다' },
        ],
        bands: {
          high: {
            label: '핵심 동력',
            summary:
              '도전적인 목표가 주어질 때 몰입과 성과가 극대화되는 유형입니다. 다만 목표가 모호하거나 반복 업무가 길어지면 동기가 급격히 떨어질 수 있으니, 스스로 단기 목표를 설계해 도전의 밀도를 유지하는 것이 좋습니다.',
          },
          mid: {
            label: '상황적 동력',
            summary:
              '의미를 느끼는 영역에서는 성취 욕구가 충분히 발휘됩니다. 모든 일에 높은 기준을 적용하기보다, 본인이 중요하다고 여기는 과제를 선별해 도전할 때 동기가 살아납니다.',
          },
          low: {
            label: '보조 동력',
            summary:
              '성취 그 자체보다 관계·안정 등 다른 가치에서 동기를 얻는 유형입니다. 경쟁적 목표 부여는 오히려 부담이 될 수 있으니, 본인에게 의미 있는 동기 요인을 먼저 확인하는 것이 효과적입니다.',
          },
        },
      },
      {
        key: 'INFLUENCE',
        name: '영향력동기',
        description: '의사결정에 영향을 미치고 일의 방향을 이끄는 데서 동기를 얻는 정도',
        items: [
          { text: '회의에서 결론의 방향을 내가 주도할 때 만족감이 크다' },
          { text: '중요한 의사결정에 내 의견이 반영되는 것이 중요하다' },
          { text: '사람들을 설득해 생각을 바꾸는 과정이 즐겁다' },
        ],
        bands: {
          high: {
            label: '핵심 동력',
            summary:
              '방향을 제시하고 사람을 움직이는 역할에서 가장 큰 에너지를 얻습니다. 리더 역할이 잘 맞지만, 영향력이 통제로 변질되지 않도록 의견 수렴 과정을 의식적으로 설계할 필요가 있습니다.',
          },
          mid: {
            label: '상황적 동력',
            summary:
              '전문성이 있는 영역에서는 적극적으로 영향력을 발휘하고, 그 외에는 한 발 물러서는 균형형입니다. 영향력을 발휘할 무대를 의도적으로 선택하면 만족도가 높아집니다.',
          },
          low: {
            label: '보조 동력',
            summary:
              '주도권보다 기여 자체에서 만족을 얻는 유형입니다. 전면에 나서기를 요구받는 역할보다, 전문성으로 뒷받침하는 역할에서 강점이 발휘될 수 있습니다.',
          },
        },
      },
      {
        key: 'AFFILIATION',
        name: '관계동기',
        description: '함께 일하는 사람들과의 유대감과 소속감에서 에너지를 얻는 정도',
        items: [
          { text: '함께 일하는 사람들과의 유대감이 업무 만족도에 큰 영향을 준다' },
          { text: '혼자 하는 일보다 팀으로 하는 일에서 에너지를 얻는다' },
          { text: '동료가 어려움을 겪으면 내 일을 미뤄서라도 돕는 편이다' },
        ],
        bands: {
          high: {
            label: '핵심 동력',
            summary:
              '신뢰 관계가 형성된 팀에서 최고의 성과를 내는 유형입니다. 다만 관계를 지키려다 어려운 피드백이나 불편한 결정을 미루는 경향이 생길 수 있으니 주의가 필요합니다.',
          },
          mid: {
            label: '상황적 동력',
            summary:
              '좋은 관계는 중요하지만 그것이 일의 전부는 아닌 균형형입니다. 협업과 개인 작업을 오가는 역할 구성이 잘 맞습니다.',
          },
          low: {
            label: '보조 동력',
            summary:
              '관계보다 과업 자체에 집중할 때 에너지가 유지되는 유형입니다. 깊고 좁은 협력 관계가 잘 맞으며, 네트워킹 중심 역할은 소모가 클 수 있습니다.',
          },
        },
      },
      {
        key: 'AUTONOMY',
        name: '자율동기',
        description: '일하는 방식과 순서를 스스로 결정할 수 있을 때 동기가 높아지는 정도',
        items: [
          { text: '일하는 방식과 순서를 스스로 정할 수 있을 때 성과가 가장 좋다' },
          { text: '세세한 지시를 받으면 일할 의욕이 떨어진다' },
          { text: '결과만 합의되면 과정은 내 재량에 맡겨지길 원한다' },
        ],
        bands: {
          high: {
            label: '핵심 동력',
            summary:
              '재량권이 보장될 때 책임감과 창의성이 함께 올라가는 유형입니다. 마이크로매니징 환경에서는 동기가 급격히 소진되므로, 권한 범위를 사전에 명확히 합의하는 것이 중요합니다.',
          },
          mid: {
            label: '상황적 동력',
            summary:
              '자율과 가이드 사이의 균형을 선호합니다. 큰 방향은 합의하되 실행 방식은 위임받는 구조에서 안정적으로 성과를 냅니다.',
          },
          low: {
            label: '보조 동력',
            summary:
              '명확한 가이드와 체계가 있을 때 더 편안하게 몰입하는 유형입니다. 모호한 권한 위임보다 기대 수준이 구체적으로 정의된 환경이 잘 맞습니다.',
          },
        },
      },
      {
        key: 'STABILITY',
        name: '안정동기',
        description: '예측 가능성과 안정적인 환경을 중시하는 정도',
        items: [
          { text: '예측 가능한 환경에서 일할 때 마음이 편하고 성과도 좋다' },
          { text: '변화가 잦은 조직보다 체계가 잡힌 조직을 선호한다' },
          { text: '장기적인 고용 안정성은 직장 선택의 중요한 기준이다' },
        ],
        bands: {
          high: {
            label: '핵심 동력',
            summary:
              '안정적이고 예측 가능한 환경에서 꾸준한 성과를 내는 유형입니다. 급격한 변화 국면에서는 스트레스가 커질 수 있으니, 변화의 이유와 일정에 대한 정보를 먼저 확보하는 것이 도움이 됩니다.',
          },
          mid: {
            label: '상황적 동력',
            summary:
              '기본적인 안정이 확보되면 적절한 변화는 오히려 자극이 되는 균형형입니다. 안정과 도전이 공존하는 환경에서 만족도가 높습니다.',
          },
          low: {
            label: '보조 동력',
            summary:
              '안정보다 변화와 새로움에 끌리는 유형입니다. 정형화된 환경이 길어지면 지루함을 느끼기 쉬우니, 주기적으로 새로운 과제를 확보하는 것이 좋습니다.',
          },
        },
      },
      {
        key: 'GROWTH',
        name: '성장동기',
        description: '새로운 것을 배우고 어제보다 나아지는 데서 동기를 얻는 정도',
        items: [
          { text: '새로운 지식이나 기술을 배우는 것 자체가 즐겁다' },
          { text: '지금 익숙한 일보다 배울 게 있는 일을 선택하는 편이다' },
          { text: '1년 전의 나보다 성장했는지 주기적으로 돌아본다' },
        ],
        bands: {
          high: {
            label: '핵심 동력',
            summary:
              '학습과 성장이 곧 보상인 유형으로, 배울 것이 있는 환경에서는 어려움도 기꺼이 감수합니다. 다만 성장이 정체됐다고 느끼면 이직·이탈 동기가 빠르게 올라가므로 성장 경로를 주기적으로 점검하세요.',
          },
          mid: {
            label: '상황적 동력',
            summary:
              '필요와 흥미가 맞을 때 학습에 몰입하는 실용적 성장형입니다. 업무와 직결된 학습 기회가 주어질 때 동기가 가장 잘 발휘됩니다.',
          },
          low: {
            label: '보조 동력',
            summary:
              '새로움보다 숙련을 깊게 하는 데서 만족을 얻는 유형입니다. 이미 가진 전문성을 발휘하고 인정받는 환경이 잘 맞습니다.',
          },
        },
      },
    ],
  },
  {
    group: '성격',
    dimensions: [
      {
        key: 'EXTRAVERSION',
        name: '외향성',
        description: '사람들과의 교류에서 에너지를 얻고 적극적으로 표현하는 성향',
        items: [
          { text: '처음 만나는 사람들과도 쉽게 대화를 시작한다' },
          { text: '여러 사람과 함께 있을 때 에너지가 충전된다' },
          { text: '모임에서 듣는 쪽보다 말하는 쪽에 가깝다' },
        ],
        bands: {
          high: {
            label: '뚜렷한 성향',
            summary:
              '사람들과의 교류가 곧 에너지원입니다. 네트워킹·발표·퍼실리테이션 역할에서 강점이 드러나지만, 혼자 깊게 파고드는 작업 시간을 의식적으로 확보할 필요가 있습니다.',
          },
          mid: {
            label: '균형 성향',
            summary:
              '상황에 따라 외향과 내향을 오가는 양향형입니다. 교류와 집중 작업을 모두 소화할 수 있어 역할 적응의 폭이 넓습니다.',
          },
          low: {
            label: '내향 성향',
            summary:
              '깊이 있는 일대일 대화와 집중 작업에서 강점이 발휘됩니다. 다수 앞에 서는 일은 에너지 소모가 크므로, 사전 준비 시간과 회복 시간을 확보하면 부담이 줄어듭니다.',
          },
        },
      },
      {
        key: 'CONSCIENTIOUSNESS',
        name: '성실성',
        description: '계획적으로 일하고 끝까지 책임지는 성향',
        items: [
          { text: '마감 기한은 어떤 일이 있어도 지키려 한다' },
          { text: '일을 시작하기 전에 계획부터 세운다' },
          { text: '맡은 일은 끝까지 마무리해야 마음이 놓인다' },
        ],
        bands: {
          high: {
            label: '뚜렷한 성향',
            summary:
              '신뢰할 수 있는 실행과 꼼꼼한 마무리가 트레이드마크입니다. 다만 기준이 높은 만큼 과부하를 스스로 만들 수 있어, 완성도와 속도의 우선순위를 구분하는 연습이 필요합니다.',
          },
          mid: {
            label: '균형 성향',
            summary:
              '중요한 일에는 체계적으로, 그 외에는 유연하게 접근하는 실용형입니다. 우선순위가 명확할 때 강점이 잘 드러납니다.',
          },
          low: {
            label: '유연 성향',
            summary:
              '계획보다 즉흥과 적응에 강한 유형입니다. 변화가 많은 환경에서 강점이 되지만, 반복적인 마감 관리가 필요한 일에서는 외부 장치(체크리스트, 리마인더)를 활용하는 것이 좋습니다.',
          },
        },
      },
      {
        key: 'OPENNESS',
        name: '개방성',
        description: '새로운 아이디어와 방식에 대한 호기심과 수용성',
        items: [
          { text: '익숙한 방식보다 새로운 방식을 시도해 보는 것을 좋아한다' },
          { text: '내 분야가 아닌 주제에도 호기심이 많다' },
          { text: '기존의 통념에 의문을 제기하는 편이다' },
        ],
        bands: {
          high: {
            label: '뚜렷한 성향',
            summary:
              '새로운 아이디어를 연결하고 변화를 먼저 받아들이는 유형입니다. 기획·혁신 과제에서 강점이 크지만, 아이디어를 끝까지 실행으로 연결하는 파트너나 장치가 있으면 더 좋습니다.',
          },
          mid: {
            label: '균형 성향',
            summary:
              '검증된 방식을 기본으로 하되 필요하면 새로움을 받아들이는 실용형입니다. 안정과 혁신 사이의 가교 역할에 적합합니다.',
          },
          low: {
            label: '실용 성향',
            summary:
              '검증된 방법과 구체적인 사실을 선호하는 유형입니다. 운영의 안정성을 지키는 데 강점이 있으며, 새로운 시도는 작은 실험부터 시작하면 부담이 적습니다.',
          },
        },
      },
      {
        key: 'AGREEABLENESS',
        name: '친화성',
        description: '타인을 배려하고 협력적으로 관계 맺는 성향',
        items: [
          { text: '상대방의 입장에서 생각해 보려고 노력한다' },
          { text: '갈등 상황에서 양보하는 쪽을 택할 때가 많다' },
          { text: '다른 사람의 성공을 진심으로 축하해 준다' },
        ],
        bands: {
          high: {
            label: '뚜렷한 성향',
            summary:
              '따뜻함과 배려로 팀의 심리적 안전감을 만드는 유형입니다. 다만 거절과 직면이 필요한 순간에 자기 입장을 양보해 버릴 수 있으니, 건강한 자기주장 연습이 도움이 됩니다.',
          },
          mid: {
            label: '균형 성향',
            summary:
              '협력할 때와 맞설 때를 구분하는 균형형입니다. 관계와 성과 사이에서 실용적인 판단을 내릴 수 있습니다.',
          },
          low: {
            label: '독립 성향',
            summary:
              '관계의 편안함보다 솔직함과 결과를 우선하는 유형입니다. 어려운 결정과 협상에 강하지만, 전달 방식을 다듬으면 같은 메시지도 훨씬 잘 수용됩니다.',
          },
        },
      },
      {
        key: 'EMOTIONAL_STABILITY',
        name: '정서안정성',
        description: '압박과 스트레스 상황에서 평정심을 유지하는 성향',
        items: [
          { text: '압박이 심한 상황에서도 평정심을 유지하는 편이다' },
          { text: '작은 일에도 쉽게 불안해지는 편이다', reversed: true },
          { text: '실수한 뒤에도 감정을 빠르게 추스른다' },
        ],
        bands: {
          high: {
            label: '뚜렷한 성향',
            summary:
              '위기 상황에서도 침착함을 유지해 주변에 안정감을 주는 유형입니다. 다만 본인이 평온해 보이는 만큼 팀원들의 불안 신호를 놓치지 않도록 의식적으로 살피는 것이 좋습니다.',
          },
          mid: {
            label: '균형 성향',
            summary:
              '대부분의 상황에서 안정적이지만, 압박이 누적되면 흔들릴 수 있는 일반적인 범위입니다. 스트레스가 쌓이기 전에 회복 루틴을 가동하는 것이 핵심입니다.',
          },
          low: {
            label: '민감 성향',
            summary:
              '감정의 진폭이 크고 위험 신호에 민감한 유형입니다. 이 민감함은 리스크를 먼저 감지하는 강점이 되기도 하지만, 회복 루틴과 지지 관계를 갖추는 것이 성과 유지에 중요합니다.',
          },
        },
      },
    ],
  },
  {
    group: '강점',
    dimensions: [
      {
        key: 'STRATEGIC_THINKING',
        name: '전략적 사고',
        description: '전체 그림을 보고 핵심을 짚어 방향을 설계하는 힘',
        items: [
          { text: '눈앞의 일을 하면서도 전체 그림과 연결해 생각한다' },
          { text: '복잡한 문제에서 핵심 변수를 빠르게 짚어낸다' },
          { text: '의사결정을 할 때 두세 수 앞의 파급효과까지 따져본다' },
        ],
        bands: {
          high: {
            label: '두드러진 강점',
            summary:
              '큰 그림과 디테일을 연결하는 사고가 강점입니다. 방향 설정·기획 단계에서 팀에 가장 큰 가치를 더하며, 이 강점이 잘 쓰이는 의사결정 자리에 의도적으로 참여하세요.',
          },
          mid: {
            label: '보유 강점',
            summary:
              '필요한 상황에서는 전략적 관점을 충분히 발휘할 수 있는 수준입니다. 일을 시작하기 전에 "이 일이 전체에서 어떤 의미인가"를 묻는 습관을 들이면 더 자라납니다.',
          },
          low: {
            label: '개발 영역',
            summary:
              '현재는 실행과 현장에 강점의 무게가 실려 있는 편입니다. 전략적 관점이 필요한 일은 큰 그림을 잘 보는 동료와 짝을 이루면 보완됩니다.',
          },
        },
      },
      {
        key: 'EXECUTION',
        name: '실행력',
        description: '계획을 실제 결과물로 만들어내는 힘',
        items: [
          { text: '아이디어가 나오면 빠르게 실행으로 옮긴다' },
          { text: '장애물이 생겨도 일정과 품질을 지켜낸다' },
          { text: "'검토만 하다 끝나는 일'이 거의 없다" },
        ],
        bands: {
          high: {
            label: '두드러진 강점',
            summary:
              '말이 아니라 결과로 증명하는 유형입니다. 일을 끝내는 힘이 신뢰의 원천이지만, 속도가 붙은 상태에서 방향 점검을 건너뛰지 않도록 중간 체크포인트를 두세요.',
          },
          mid: {
            label: '보유 강점',
            summary:
              '동기가 분명한 일에서는 안정적인 실행력을 보입니다. 시작의 문턱을 낮추는 장치(첫 행동을 아주 작게 정의)가 실행의 일관성을 높여줍니다.',
          },
          low: {
            label: '개발 영역',
            summary:
              '구상과 검토에 강점이 있는 반면 실행 전환이 느려질 수 있습니다. 마감을 잘게 쪼개고 진행을 함께 점검할 파트너를 두면 효과적입니다.',
          },
        },
      },
      {
        key: 'INFLUENCING',
        name: '대인 영향력',
        description: '설득과 소통으로 사람을 움직이는 힘',
        items: [
          { text: '내 제안에 사람들이 움직이도록 설득할 수 있다' },
          { text: '상대에 따라 설득 방식을 다르게 가져간다' },
          { text: '어려운 요청도 관계를 해치지 않고 전달한다' },
        ],
        bands: {
          high: {
            label: '두드러진 강점',
            summary:
              '사람을 읽고 움직이는 능력이 강점입니다. 이해관계가 복잡한 일의 조율자로 적합하며, 영향력이 큰 만큼 메시지의 일관성과 진정성 관리가 평판을 좌우합니다.',
          },
          mid: {
            label: '보유 강점',
            summary:
              '신뢰가 쌓인 관계에서는 충분한 설득력을 발휘합니다. 설득 전에 상대의 관심사를 한 가지 더 파악하는 습관이 영향력의 반경을 넓혀줍니다.',
          },
          low: {
            label: '개발 영역',
            summary:
              '논리나 결과물로 말하는 쪽이 더 편한 유형입니다. 직접 설득보다 데이터와 사례로 뒷받침하는 방식, 또는 영향력 있는 지지자를 먼저 확보하는 방식이 잘 맞습니다.',
          },
        },
      },
      {
        key: 'COLLABORATION',
        name: '협업',
        description: '팀 전체의 성과를 위해 연결하고 조율하는 힘',
        items: [
          { text: '내 성과보다 팀 전체의 성과를 우선한다' },
          { text: '정보를 먼저 공유해 동료의 일을 쉽게 만든다' },
          { text: '부서 간 입장 차이를 조율하는 역할을 자주 맡는다' },
        ],
        bands: {
          high: {
            label: '두드러진 강점',
            summary:
              '팀의 윤활유 역할을 하는 유형입니다. 조직 간 협력이 필요한 과제에서 가치가 크지만, 조율에 시간이 쏠려 본인 과업이 밀리지 않도록 경계를 관리하세요.',
          },
          mid: {
            label: '보유 강점',
            summary:
              '협업의 기본기는 갖추고 있으며, 목적이 분명한 협력에서는 적극적입니다. 정보 공유의 주기를 한 단계 더 빠르게 가져가면 협업 평판이 올라갑니다.',
          },
          low: {
            label: '개발 영역',
            summary:
              '독립적으로 완결하는 일에 강점이 있는 유형입니다. 모든 일을 협업할 필요는 없지만, 일의 시작과 끝에 이해관계자 공유 지점을 정해두면 마찰이 줄어듭니다.',
          },
        },
      },
      {
        key: 'LEARNING_AGILITY',
        name: '학습민첩성',
        description: '경험에서 빠르게 배우고 새로운 상황에 적용하는 힘',
        items: [
          { text: '처음 해보는 일도 빠르게 요령을 익힌다' },
          { text: '실패 경험에서 교훈을 뽑아 다음에 적용한다' },
          { text: '피드백을 받으면 행동을 실제로 바꾼다' },
        ],
        bands: {
          high: {
            label: '두드러진 강점',
            summary:
              '낯선 과제일수록 빛나는 유형으로, 변화 국면에서 가장 먼저 투입할 만한 인재입니다. 새로움을 쫓느라 한 분야의 깊이가 얕아지지 않도록 축적의 영역을 하나 정해두세요.',
          },
          mid: {
            label: '보유 강점',
            summary:
              '경험에서 배우는 힘은 충분하며, 돌아보는 시간을 가질 때 학습 효과가 커집니다. 일이 끝날 때마다 "다음에 다르게 할 한 가지"를 기록하는 습관을 추천합니다.',
          },
          low: {
            label: '개발 영역',
            summary:
              '익숙한 영역에서의 숙련에 강점이 있는 유형입니다. 새로운 상황에서는 적응 기간을 충분히 확보하고, 앞서 경험한 사람에게 배우는 경로를 활용하면 효과적입니다.',
          },
        },
      },
      {
        key: 'RESILIENCE',
        name: '회복탄력성',
        description: '좌절과 스트레스에서 회복해 다시 나아가는 힘',
        items: [
          { text: '큰 좌절을 겪어도 비교적 빨리 회복한다' },
          { text: '스트레스 상황에서도 할 일에 집중할 수 있다' },
          { text: '힘든 시기를 겪으며 오히려 단단해졌다고 느낀다' },
        ],
        bands: {
          high: {
            label: '두드러진 강점',
            summary:
              '실패와 압박을 성장의 재료로 바꾸는 유형입니다. 불확실성이 큰 과제의 적임자이지만, 견디는 힘이 강한 만큼 한계 신호를 무시하지 않도록 정기적인 셀프 점검이 필요합니다.',
          },
          mid: {
            label: '보유 강점',
            summary:
              '일반적인 수준의 회복력을 갖추고 있습니다. 회복을 돕는 자기만의 루틴(운동, 대화, 기록 등)을 명시적으로 만들어두면 큰 파도에도 흔들림이 줄어듭니다.',
          },
          low: {
            label: '개발 영역',
            summary:
              '좌절의 여운이 길게 남는 편으로, 그만큼 일을 진지하게 대한다는 의미이기도 합니다. 힘든 일을 혼자 소화하기보다 신뢰할 수 있는 사람과 나누는 구조를 만드는 것이 가장 효과적입니다.',
          },
        },
      },
    ],
  },
  {
    group: '드레일먼트',
    dimensions: [
      {
        key: 'OVERCONFIDENCE',
        name: '과신',
        description: '자기 판단에 대한 확신이 지나쳐 반대 의견과 위험 신호를 놓칠 위험',
        isRisk: true,
        items: [
          { text: '내 판단이 대체로 옳았기 때문에 반대 의견을 듣는 데 시간을 쓰지 않는 편이다' },
          { text: '일이 잘못되면 내 판단보다 외부 요인 탓일 때가 많다' },
          { text: '충분히 알고 있다고 느끼면 추가 검토 없이 결정한다' },
        ],
        bands: {
          high: {
            label: '주의 신호',
            summary:
              '자신감이 검증을 건너뛰는 단계로 넘어갈 위험이 있습니다. 중요한 결정 전에 "내가 틀렸다면 어디서부터인가"를 묻고, 반대 의견을 말할 역할을 의도적으로 지정하는 장치를 추천합니다.',
          },
          mid: {
            label: '상황적 주의',
            summary:
              '평소에는 균형적이지만 성공 경험이 쌓이거나 시간 압박이 클 때 검증을 생략할 수 있습니다. 익숙한 영역일수록 한 번 더 점검하는 습관이 안전판이 됩니다.',
          },
          low: {
            label: '안정 범위',
            summary:
              '자기 판단을 과신하지 않고 검증과 피드백에 열려 있는 상태입니다. 현재의 개방적 태도를 유지하되, 지나친 자기 의심으로 결정이 늦어지지 않는지만 살피면 됩니다.',
          },
        },
      },
      {
        key: 'PERFECTIONISM',
        name: '완벽주의',
        description: '과도하게 높은 기준으로 위임이 어려워지고 병목이 될 위험',
        isRisk: true,
        items: [
          { text: '내 기준에 못 미치는 결과물은 그냥 넘기지 못한다' },
          { text: '남에게 맡기느니 내가 다시 하는 게 낫다고 느낄 때가 많다' },
          { text: '사소한 오류 하나에도 전체 완성도가 무너진다고 느낀다' },
        ],
        bands: {
          high: {
            label: '주의 신호',
            summary:
              '높은 기준이 본인 과부하와 팀의 병목으로 이어질 위험이 있습니다. 일마다 "충분히 좋은 수준"을 사전에 정의하고, 80% 완성도로 위임하는 연습부터 시작해 보세요.',
          },
          mid: {
            label: '상황적 주의',
            summary:
              '평소에는 기준과 효율의 균형을 잡지만, 중요도가 높거나 평가받는 일에서 완벽주의가 강해질 수 있습니다. 그런 일일수록 마감 전 검토 횟수를 미리 정해두는 것이 효과적입니다.',
          },
          low: {
            label: '안정 범위',
            summary:
              '완성도에 대한 집착 없이 실용적으로 일을 마무리하는 상태입니다. 품질 기준이 높은 이해관계자와 일할 때만 기대 수준을 미리 맞추면 충분합니다.',
          },
        },
      },
      {
        key: 'AVOIDANCE',
        name: '회피',
        description: '갈등과 어려운 결정을 미루다 문제를 키울 위험',
        isRisk: true,
        items: [
          { text: '껄끄러운 대화는 가능한 한 뒤로 미루는 편이다' },
          { text: '결정이 어려우면 상황이 정리될 때까지 기다린다' },
          { text: '갈등이 생기면 그 자리를 피하고 싶어진다' },
        ],
        bands: {
          high: {
            label: '주의 신호',
            summary:
              '불편한 문제를 미루는 동안 비용이 커질 위험이 있습니다. 껄끄러운 대화일수록 48시간 안에 시작한다는 규칙, 그리고 대화의 첫 문장을 미리 준비하는 방법이 실질적인 도움이 됩니다.',
          },
          mid: {
            label: '상황적 주의',
            summary:
              '대부분은 직면하지만 특정 상대나 주제 앞에서는 미루는 패턴이 있을 수 있습니다. 내가 유독 피하게 되는 상황이 무엇인지 파악하는 것이 첫걸음입니다.',
          },
          low: {
            label: '안정 범위',
            summary:
              '불편한 문제도 필요한 시점에 다루는 상태입니다. 직면의 타이밍과 함께 전달 방식의 부드러움까지 갖추면 갈등 해결의 강점으로 발전합니다.',
          },
        },
      },
      {
        key: 'MICROMANAGING',
        name: '통제 집착',
        description: '세부 사항까지 통제하려다 구성원의 자율성과 성장을 막을 위험',
        isRisk: true,
        items: [
          { text: '일의 진행 상황을 수시로 확인해야 안심이 된다' },
          { text: '작은 사항도 내 승인을 거치도록 하는 편이다' },
          { text: '내가 모르는 사이에 일이 진행되는 게 불편하다' },
        ],
        bands: {
          high: {
            label: '주의 신호',
            summary:
              '꼼꼼함이 구성원의 자율성과 주인의식을 잠식할 위험이 있습니다. 보고 주기와 개입 기준(예: 일정 지연 시에만)을 사전에 합의해, 확인하고 싶은 충동과 실제 개입을 분리해 보세요.',
          },
          mid: {
            label: '상황적 주의',
            summary:
              '평소에는 위임하지만 리스크가 크거나 경험이 적은 구성원과 일할 때 통제가 강해질 수 있습니다. 통제 수준을 일의 위험도에 따라 명시적으로 다르게 설정하면 균형이 잡힙니다.',
          },
          low: {
            label: '안정 범위',
            summary:
              '구성원에게 충분한 재량을 주는 상태입니다. 다만 위임이 방임이 되지 않도록, 합의된 체크포인트는 유지하는 것이 좋습니다.',
          },
        },
      },
      {
        key: 'APPROVAL_SEEKING',
        name: '인정 추구',
        description: '타인의 평가에 과도하게 민감해 무리한 수용과 소진으로 이어질 위험',
        isRisk: true,
        items: [
          { text: '다른 사람의 평가에 따라 기분이 크게 좌우된다' },
          { text: '거절하면 나에 대한 평가가 나빠질까 봐 무리한 요청도 받아들인다' },
          { text: '비판을 받으면 며칠 동안 머릿속에서 떠나지 않는다' },
        ],
        bands: {
          high: {
            label: '주의 신호',
            summary:
              '타인의 평가가 의사결정의 기준이 되면서 과부하와 소진으로 이어질 위험이 있습니다. 요청을 받으면 즉답하지 않고 하루 뒤에 답하는 규칙, 그리고 거절의 표준 문장을 만들어두는 것이 효과적입니다.',
          },
          mid: {
            label: '상황적 주의',
            summary:
              '평가에 대한 민감함이 동기가 되기도 하지만, 중요한 사람의 피드백 앞에서는 흔들릴 수 있습니다. 피드백을 "사람에 대한 평가"가 아니라 "결과물에 대한 정보"로 번역하는 연습이 도움이 됩니다.',
          },
          low: {
            label: '안정 범위',
            summary:
              '타인의 평가와 건강한 거리를 유지하는 상태입니다. 다만 무심함으로 비치지 않도록, 받은 피드백에 대한 반응은 분명히 표현하는 것이 좋습니다.',
          },
        },
      },
      {
        key: 'CYNICISM',
        name: '냉소',
        description: '조직과 사람에 대한 불신이 참여와 협력을 잠식할 위험',
        isRisk: true,
        items: [
          { text: '조직의 변화 시도는 결국 흐지부지될 거라고 생각한다' },
          { text: '사람들의 호의에는 대개 다른 의도가 있다고 본다' },
          { text: '회의에서 의견을 내봤자 달라질 게 없다고 느낀다' },
        ],
        bands: {
          high: {
            label: '주의 신호',
            summary:
              '누적된 실망이 불신으로 굳어져 참여 에너지를 잠식할 위험이 있습니다. 냉소 뒤에는 대개 좌절된 기대가 있습니다 — 무엇에 실망했는지 구체화하고, 영향을 미칠 수 있는 작은 영역부터 다시 시도해 보세요.',
          },
          mid: {
            label: '상황적 주의',
            summary:
              '건강한 비판 의식과 냉소 사이를 오가는 상태입니다. 비판에 대안을 함께 붙이는 습관이 냉소로 굳어지는 것을 막는 가장 좋은 방법입니다.',
          },
          low: {
            label: '안정 범위',
            summary:
              '조직과 사람에 대한 기본 신뢰가 살아 있는 상태입니다. 이 신뢰는 팀의 심리적 자산이니, 실망스러운 일이 생겼을 때 혼자 삭이지 말고 표현하는 통로를 유지하세요.',
          },
        },
      },
    ],
  },
]

function createClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')
  const pool = new Pool({ connectionString })
  return new PrismaClient({ adapter: new PrismaPg(pool) })
}

async function main() {
  const prisma = createClient()

  // 동일 slug 진단은 삭제 후 재생성 (응답도 cascade 삭제됨 — 운영 재시드 시 주의)
  await prisma.assessment.deleteMany({ where: { slug: SLUG } })

  const assessment = await prisma.assessment.create({
    data: {
      slug: SLUG,
      title: '동기·성격·강점 통합 진단',
      subtitle: '드레일먼트(탈선 위험) 포함',
      description:
        '나를 움직이는 동기, 일하는 방식에 드러나는 성격, 성과를 만드는 강점, 그리고 압박 상황에서 나타날 수 있는 탈선 위험(드레일먼트)까지 — 일하는 나를 4가지 렌즈로 입체적으로 이해하는 통합 진단입니다. 약 10분, 69문항.',
      type: 'SELF',
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: [...DEFAULT_SCALE_LABELS],
      durationMin: 10,
      isActive: true,
      sortOrder: 1,
    },
  })

  let questionOrder = 0
  for (const [groupIndex, group] of GROUPS.entries()) {
    for (const [dimIndex, dim] of group.dimensions.entries()) {
      const dimension = await prisma.dimension.create({
        data: {
          assessmentId: assessment.id,
          key: dim.key,
          group: group.group,
          name: dim.name,
          description: dim.description,
          isRisk: dim.isRisk ?? false,
          sortOrder: groupIndex * 100 + dimIndex,
        },
      })

      await prisma.interpretationBand.createMany({
        data: (['low', 'mid', 'high'] as const).map((bandKey) => ({
          dimensionId: dimension.id,
          band: bandKey.toUpperCase(),
          minScore: BAND_THRESHOLDS[bandKey.toUpperCase() as 'LOW' | 'MID' | 'HIGH'].min,
          maxScore: BAND_THRESHOLDS[bandKey.toUpperCase() as 'LOW' | 'MID' | 'HIGH'].max,
          label: dim.bands[bandKey].label,
          summary: dim.bands[bandKey].summary,
        })),
      })

      await prisma.question.createMany({
        data: dim.items.map((item) => ({
          assessmentId: assessment.id,
          dimensionId: dimension.id,
          text: item.text,
          isReversed: item.reversed ?? false,
          sortOrder: questionOrder++,
        })),
      })
    }
  }

  const counts = {
    dimensions: await prisma.dimension.count({ where: { assessmentId: assessment.id } }),
    questions: await prisma.question.count({ where: { assessmentId: assessment.id } }),
    bands: await prisma.interpretationBand.count({
      where: { dimension: { assessmentId: assessment.id } },
    }),
  }
  console.log(`Seeded "${assessment.title}" (/a/${SLUG})`, counts)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
