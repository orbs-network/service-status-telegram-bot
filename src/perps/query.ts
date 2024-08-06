import { format } from 'date-fns';

export function getSummary(env: string, startDate: Date, endDate: Date) {
  return JSON.stringify({
    aggs: {
      '0': {
        date_histogram: {
          field: 'timestamp',
          calendar_interval: '1d',
        },
        aggs: {
          marginBalance: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'BROKER_BALANCE',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              marginBalance: {
                top_hits: {
                  script_fields: {
                    marginBalanceNum: {
                      script: {
                        source:
                          "if (doc['marginBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['marginBalance.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
                        lang: 'painless',
                      },
                    },
                  },
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
          totalPartyBUnPnl: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'ALLOCATED_POSITIONS',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              totalPartyBUnPnl: {
                top_hits: {
                  script_fields: {
                    totalPartyBUnPnl: {
                      script: {
                        source:
                          "if (doc['totalPartyBUpnl.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['totalPartyBUpnl.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
                        lang: 'painless',
                      },
                    },
                  },
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
          partyBAllocatedBalance: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'ALLOCATED_POSITIONS',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              partyBAllocatedBalance: {
                top_hits: {
                  script_fields: {
                    partyBAllocatedBalanceNum: {
                      script: {
                        source:
                          "if (doc['totalPartyBAllocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['totalPartyBAllocatedBalance.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
                        lang: 'painless',
                      },
                    },
                  },
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
          erc20Balance: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'ERC20_BALANCE',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              erc20Balance: {
                top_hits: {
                  script_fields: {
                    erc20BalanceNum: {
                      script: {
                        source:
                          "if (doc['erc20Balance.keyword'].size() == 0) {\n    return 0;\n} else {\n    return Double.parseDouble(doc['erc20Balance.keyword'].value);\n}",
                        lang: 'painless',
                      },
                    },
                  },
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
          volume: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: '[TRADE_OPEN_CONFIRMED,TRADE_CLOSE_CONFIRMED]',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              volume: {
                sum: {
                  script: {
                    source:
                      "if (doc['notionalValue.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['notionalValue.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
                    lang: 'painless',
                  },
                },
              },
            },
          },
          trades: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: '[TRADE_OPEN_CONFIRMED,TRADE_CLOSE_CONFIRMED]',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
          },
          brokerUpnl: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'BROKER_BALANCE',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              brokerUpnl: {
                top_hits: {
                  script_fields: {
                    brokerUpnl: {
                      script: {
                        source:
                          "if (doc['upnl.keyword'].size() == 0) { \n    return 0; \n    // or any default value you prefer \n    } else { \n        return Double.parseDouble(doc['upnl.keyword'].value); \n        // Use Double.parseDouble for floating point numbers \n    }",
                        lang: 'painless',
                      },
                    },
                  },
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
          users: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: '[TRADE_OPEN_CONFIRMED,TRADE_CLOSE_CONFIRMED]',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              users: {
                cardinality: {
                  field: 'partyA.keyword',
                },
              },
            },
          },
        },
      },
    },
    size: 0,
    fields: [
      {
        field: 'timestamp',
        format: 'date_time',
      },
    ],
    script_fields: {
      filledAmount: {
        script: {
          source:
            "if (doc.containsKey('filledAmount.keyword') && doc['filledAmount.keyword'].size() > 0) {\n    return Double.parseDouble(doc['filledAmount.keyword'].value); // Use Double.parseDouble for floating point numbers\n} else {\n    return 0; // or any default value you prefer\n}",
          lang: 'painless',
        },
      },
      marginBalanceNum: {
        script: {
          source:
            "if (doc['marginBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['marginBalance.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      erc20BalanceNum: {
        script: {
          source:
            "if (doc['erc20Balance.keyword'].size() == 0) {\n    return 0;\n} else {\n    return Double.parseDouble(doc['erc20Balance.keyword'].value);\n}",
          lang: 'painless',
        },
      },
      partyBAllocatedBalanceNum: {
        script: {
          source:
            "if (doc['totalPartyBAllocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['totalPartyBAllocatedBalance.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      totalPartyBUnPnl: {
        script: {
          source:
            "if (doc['totalPartyBUpnl.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['totalPartyBUpnl.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      gasPaidNum: {
        script: {
          source:
            "if (doc['gasPaid.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['gasPaid.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      volumeUSD: {
        script: {
          source:
            "if (doc['notionalValue.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['notionalValue.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      botAddress: {
        script: {
          source:
            "if (doc['address.keyword'].size() == 0) {\n    return ''\n} else if (doc['symmId.keyword'].size() == 0) { \n    return '56a-' + doc['address.keyword'].value\n} else { \n    return doc['symmId.keyword'].value + '-' + doc['address.keyword'].value\n}",
          lang: 'painless',
        },
      },
      partyBAllocatedBalanceForSymmIdNum: {
        script: {
          source:
            "if (doc['partyBAllocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBAllocatedBalance.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      partyBUPNLForSymmIdNum: {
        script: {
          source:
            "if (doc['partyBUpnl.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBUpnl.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      partyBUnallocatedBalanceForSymmIdNum: {
        script: {
          source:
            "if (doc['partyBUnallocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBUnallocatedBalance.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      gasBalanceNum: {
        script: {
          source:
            "if (doc['balance'] instanceof float) {\n    return doc['balance'].value\n} else if (doc.containsKey('balance.keyword') && doc['balance.keyword'].size() > 0) {\n    return Double.parseDouble(doc['balance.keyword'].value); // Use Double.parseDouble for floating point numbers\n} else {\n    return 0; // or any default value you prefer\n}\n",
          lang: 'painless',
        },
      },
      brokerUpnl: {
        script: {
          source:
            "if (doc['upnl.keyword'].size() == 0) { \n    return 0; \n    // or any default value you prefer \n    } else { \n        return Double.parseDouble(doc['upnl.keyword'].value); \n        // Use Double.parseDouble for floating point numbers \n    }",
          lang: 'painless',
        },
      },
    },
    stored_fields: ['*'],
    runtime_mappings: {},
    _source: {
      excludes: [],
    },
    query: {
      bool: {
        must: [],
        filter: [
          {
            bool: {
              should: [
                {
                  match: {
                    environment: env,
                  },
                },
              ],
              minimum_should_match: 1,
            },
          },
          {
            range: {
              timestamp: {
                gte: format(startDate, 'yyyy-MM-dd'),
                lte: format(endDate, 'yyyy-MM-dd'),
              },
            },
          },
        ],
        should: [],
        must_not: [],
      },
    },
  });
}

export function getBinance(env: string, startDate: Date, endDate: Date) {
  return JSON.stringify({
    aggs: {
      '0': {
        date_histogram: {
          field: 'timestamp',
          calendar_interval: '1d',
        },
        aggs: {
          marginBalance: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'BROKER_BALANCE',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              marginBalance: {
                top_hits: {
                  script_fields: {
                    marginBalanceNum: {
                      script: {
                        source:
                          "if (doc['marginBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['marginBalance.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
                        lang: 'painless',
                      },
                    },
                  },
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
          leverage: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'BROKER_BALANCE',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              leverage: {
                top_hits: {
                  fields: [
                    {
                      field: 'leverage.keyword',
                    },
                  ],
                  _source: false,
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
          maintenanceMargin: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'BROKER_BALANCE',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              maintenanceMargin: {
                top_hits: {
                  fields: [
                    {
                      field: 'maintenanceMargin.keyword',
                    },
                  ],
                  _source: false,
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
          brokerUpnl: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'BROKER_BALANCE',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              brokerUpnl: {
                top_hits: {
                  script_fields: {
                    brokerUpnl: {
                      script: {
                        source:
                          "if (doc['upnl.keyword'].size() == 0) { \n    return 0; \n    // or any default value you prefer \n    } else { \n        return Double.parseDouble(doc['upnl.keyword'].value); \n        // Use Double.parseDouble for floating point numbers \n    }",
                        lang: 'painless',
                      },
                    },
                  },
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    size: 0,
    fields: [
      {
        field: 'timestamp',
        format: 'date_time',
      },
    ],
    script_fields: {
      filledAmount: {
        script: {
          source:
            "if (doc.containsKey('filledAmount.keyword') && doc['filledAmount.keyword'].size() > 0) {\n    return Double.parseDouble(doc['filledAmount.keyword'].value); // Use Double.parseDouble for floating point numbers\n} else {\n    return 0; // or any default value you prefer\n}",
          lang: 'painless',
        },
      },
      marginBalanceNum: {
        script: {
          source:
            "if (doc['marginBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['marginBalance.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      erc20BalanceNum: {
        script: {
          source:
            "if (doc['erc20Balance.keyword'].size() == 0) {\n    return 0;\n} else {\n    return Double.parseDouble(doc['erc20Balance.keyword'].value);\n}",
          lang: 'painless',
        },
      },
      partyBAllocatedBalanceNum: {
        script: {
          source:
            "if (doc['totalPartyBAllocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['totalPartyBAllocatedBalance.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      totalPartyBUnPnl: {
        script: {
          source:
            "if (doc['totalPartyBUpnl.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['totalPartyBUpnl.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      gasPaidNum: {
        script: {
          source:
            "if (doc['gasPaid.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['gasPaid.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      volumeUSD: {
        script: {
          source:
            "if (doc['notionalValue.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['notionalValue.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      botAddress: {
        script: {
          source:
            "if (doc['address.keyword'].size() == 0) {\n    return ''\n} else if (doc['symmId.keyword'].size() == 0) { \n    return '56a-' + doc['address.keyword'].value\n} else { \n    return doc['symmId.keyword'].value + '-' + doc['address.keyword'].value\n}",
          lang: 'painless',
        },
      },
      partyBAllocatedBalanceForSymmIdNum: {
        script: {
          source:
            "if (doc['partyBAllocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBAllocatedBalance.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      partyBUPNLForSymmIdNum: {
        script: {
          source:
            "if (doc['partyBUpnl.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBUpnl.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      partyBUnallocatedBalanceForSymmIdNum: {
        script: {
          source:
            "if (doc['partyBUnallocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBUnallocatedBalance.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      gasBalanceNum: {
        script: {
          source:
            "if (doc['balance'] instanceof float) {\n    return doc['balance'].value\n} else if (doc.containsKey('balance.keyword') && doc['balance.keyword'].size() > 0) {\n    return Double.parseDouble(doc['balance.keyword'].value); // Use Double.parseDouble for floating point numbers\n} else {\n    return 0; // or any default value you prefer\n}\n",
          lang: 'painless',
        },
      },
      brokerUpnl: {
        script: {
          source:
            "if (doc['upnl.keyword'].size() == 0) { \n    return 0; \n    // or any default value you prefer \n    } else { \n        return Double.parseDouble(doc['upnl.keyword'].value); \n        // Use Double.parseDouble for floating point numbers \n    }",
          lang: 'painless',
        },
      },
    },
    stored_fields: ['*'],
    runtime_mappings: {},
    _source: {
      excludes: [],
    },
    query: {
      bool: {
        must: [],
        filter: [
          {
            bool: {
              should: [
                {
                  match: {
                    environment: env,
                  },
                },
              ],
              minimum_should_match: 1,
            },
          },
          {
            range: {
              timestamp: {
                gte: format(startDate, 'yyyy-MM-dd'),
                lte: format(endDate, 'yyyy-MM-dd'),
              },
            },
          },
        ],
        should: [],
        must_not: [],
      },
    },
  });
}

export function getCrossChain(env: string, startDate: Date, endDate: Date) {
  return JSON.stringify({
    aggs: {
      '0': {
        date_histogram: {
          field: 'timestamp',
          calendar_interval: '1d',
        },
        aggs: {
          totalPartyBUnPnl: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'ALLOCATED_POSITIONS',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              totalPartyBUnPnl: {
                top_hits: {
                  script_fields: {
                    totalPartyBUnPnl: {
                      script: {
                        source:
                          "if (doc['totalPartyBUpnl.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['totalPartyBUpnl.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
                        lang: 'painless',
                      },
                    },
                  },
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
          partyBAllocatedBalance: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'ALLOCATED_POSITIONS',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              partyBAllocatedBalance: {
                top_hits: {
                  script_fields: {
                    partyBAllocatedBalanceNum: {
                      script: {
                        source:
                          "if (doc['totalPartyBAllocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['totalPartyBAllocatedBalance.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
                        lang: 'painless',
                      },
                    },
                  },
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
          erc20Balance: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'ERC20_BALANCE',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              erc20Balance: {
                top_hits: {
                  script_fields: {
                    erc20BalanceNum: {
                      script: {
                        source:
                          "if (doc['erc20Balance.keyword'].size() == 0) {\n    return 0;\n} else {\n    return Double.parseDouble(doc['erc20Balance.keyword'].value);\n}",
                        lang: 'painless',
                      },
                    },
                  },
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
          totalInitialLongNotional: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'PORTFOLIO_LONG_SHORT_RATIO',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              totalInitialLongNotional: {
                top_hits: {
                  fields: [
                    {
                      field: 'totalInitialLongNotional',
                    },
                  ],
                  _source: false,
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
          totalInitialShortNotional: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'PORTFOLIO_LONG_SHORT_RATIO',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              totalInitialShortNotional: {
                top_hits: {
                  fields: [
                    {
                      field: 'totalInitialShortNotional',
                    },
                  ],
                  _source: false,
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
          initialLongShortRatio: {
            filter: {
              bool: {
                must: [],
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match: {
                            msgCode: 'PORTFOLIO_LONG_SHORT_RATIO',
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
                should: [],
                must_not: [],
              },
            },
            aggs: {
              initialLongShortRatio: {
                top_hits: {
                  fields: [
                    {
                      field: 'initialLongShortRatio',
                    },
                  ],
                  _source: false,
                  size: 1,
                  sort: [
                    {
                      timestamp: {
                        order: 'desc',
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    size: 0,
    fields: [
      {
        field: 'timestamp',
        format: 'date_time',
      },
    ],
    script_fields: {
      filledAmount: {
        script: {
          source:
            "if (doc.containsKey('filledAmount.keyword') && doc['filledAmount.keyword'].size() > 0) {\n    return Double.parseDouble(doc['filledAmount.keyword'].value); // Use Double.parseDouble for floating point numbers\n} else {\n    return 0; // or any default value you prefer\n}",
          lang: 'painless',
        },
      },
      marginBalanceNum: {
        script: {
          source:
            "if (doc['marginBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['marginBalance.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      erc20BalanceNum: {
        script: {
          source:
            "if (doc['erc20Balance.keyword'].size() == 0) {\n    return 0;\n} else {\n    return Double.parseDouble(doc['erc20Balance.keyword'].value);\n}",
          lang: 'painless',
        },
      },
      partyBAllocatedBalanceNum: {
        script: {
          source:
            "if (doc['totalPartyBAllocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['totalPartyBAllocatedBalance.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      totalPartyBUnPnl: {
        script: {
          source:
            "if (doc['totalPartyBUpnl.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['totalPartyBUpnl.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      gasPaidNum: {
        script: {
          source:
            "if (doc['gasPaid.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['gasPaid.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      volumeUSD: {
        script: {
          source:
            "if (doc['notionalValue.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['notionalValue.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      botAddress: {
        script: {
          source:
            "if (doc['address.keyword'].size() == 0) {\n    return ''\n} else if (doc['symmId.keyword'].size() == 0) { \n    return '56a-' + doc['address.keyword'].value\n} else { \n    return doc['symmId.keyword'].value + '-' + doc['address.keyword'].value\n}",
          lang: 'painless',
        },
      },
      partyBAllocatedBalanceForSymmIdNum: {
        script: {
          source:
            "if (doc['partyBAllocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBAllocatedBalance.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      partyBUPNLForSymmIdNum: {
        script: {
          source:
            "if (doc['partyBUpnl.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBUpnl.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      partyBUnallocatedBalanceForSymmIdNum: {
        script: {
          source:
            "if (doc['partyBUnallocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBUnallocatedBalance.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      gasBalanceNum: {
        script: {
          source:
            "if (doc['balance'] instanceof float) {\n    return doc['balance'].value\n} else if (doc.containsKey('balance.keyword') && doc['balance.keyword'].size() > 0) {\n    return Double.parseDouble(doc['balance.keyword'].value); // Use Double.parseDouble for floating point numbers\n} else {\n    return 0; // or any default value you prefer\n}\n",
          lang: 'painless',
        },
      },
      brokerUpnl: {
        script: {
          source:
            "if (doc['upnl.keyword'].size() == 0) { \n    return 0; \n    // or any default value you prefer \n    } else { \n        return Double.parseDouble(doc['upnl.keyword'].value); \n        // Use Double.parseDouble for floating point numbers \n    }",
          lang: 'painless',
        },
      },
    },
    stored_fields: ['*'],
    runtime_mappings: {},
    _source: {
      excludes: [],
    },
    query: {
      bool: {
        must: [],
        filter: [
          {
            bool: {
              should: [
                {
                  match: {
                    environment: env,
                  },
                },
              ],
              minimum_should_match: 1,
            },
          },
          {
            range: {
              timestamp: {
                gte: format(startDate, 'yyyy-MM-dd'),
                lte: format(endDate, 'yyyy-MM-dd'),
              },
            },
          },
        ],
        should: [],
        must_not: [],
      },
    },
  });
}

export function getPerSymmId(env: string, startDate: Date, endDate: Date) {
  return JSON.stringify({
    aggs: {
      '0': {
        terms: {
          field: 'symmId.keyword',
          order: {
            _key: 'asc',
          },
          size: 10,
        },
        aggs: {
          '1': {
            date_histogram: {
              field: 'timestamp',
              calendar_interval: '1d',
            },
            aggs: {
              partyBUnallocatedBalanceForSymmId: {
                filter: {
                  bool: {
                    must: [],
                    filter: [
                      {
                        bool: {
                          should: [
                            {
                              match: {
                                msgCode: 'ONCHAIN_BALANCE_PER_SYMM_ID',
                              },
                            },
                          ],
                          minimum_should_match: 1,
                        },
                      },
                    ],
                    should: [],
                    must_not: [],
                  },
                },
                aggs: {
                  partyBUnallocatedBalanceForSymmId: {
                    top_hits: {
                      script_fields: {
                        partyBUnallocatedBalanceForSymmIdNum: {
                          script: {
                            source:
                              "if (doc['partyBUnallocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBUnallocatedBalance.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
                            lang: 'painless',
                          },
                        },
                      },
                      size: 1,
                      sort: [
                        {
                          timestamp: {
                            order: 'desc',
                          },
                        },
                      ],
                    },
                  },
                },
              },
              partyBUPNLForSymmId: {
                filter: {
                  bool: {
                    must: [],
                    filter: [
                      {
                        bool: {
                          should: [
                            {
                              match: {
                                msgCode: 'ONCHAIN_BALANCE_PER_SYMM_ID',
                              },
                            },
                          ],
                          minimum_should_match: 1,
                        },
                      },
                    ],
                    should: [],
                    must_not: [],
                  },
                },
                aggs: {
                  partyBUPNLForSymmId: {
                    top_hits: {
                      script_fields: {
                        partyBUPNLForSymmIdNum: {
                          script: {
                            source:
                              "if (doc['partyBUpnl.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBUpnl.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
                            lang: 'painless',
                          },
                        },
                      },
                      size: 1,
                      sort: [
                        {
                          timestamp: {
                            order: 'desc',
                          },
                        },
                      ],
                    },
                  },
                },
              },
              partyBAllocatedBalanceForSymmId: {
                filter: {
                  bool: {
                    must: [],
                    filter: [
                      {
                        bool: {
                          should: [
                            {
                              match: {
                                msgCode: 'ONCHAIN_BALANCE_PER_SYMM_ID',
                              },
                            },
                          ],
                          minimum_should_match: 1,
                        },
                      },
                    ],
                    should: [],
                    must_not: [],
                  },
                },
                aggs: {
                  partyBAllocatedBalanceForSymmId: {
                    top_hits: {
                      script_fields: {
                        partyBAllocatedBalanceForSymmIdNum: {
                          script: {
                            source:
                              "if (doc['partyBAllocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBAllocatedBalance.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
                            lang: 'painless',
                          },
                        },
                      },
                      size: 1,
                      sort: [
                        {
                          timestamp: {
                            order: 'desc',
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    size: 0,
    fields: [
      {
        field: 'timestamp',
        format: 'date_time',
      },
    ],
    script_fields: {
      filledAmount: {
        script: {
          source:
            "if (doc.containsKey('filledAmount.keyword') && doc['filledAmount.keyword'].size() > 0) {\n    return Double.parseDouble(doc['filledAmount.keyword'].value); // Use Double.parseDouble for floating point numbers\n} else {\n    return 0; // or any default value you prefer\n}",
          lang: 'painless',
        },
      },
      marginBalanceNum: {
        script: {
          source:
            "if (doc['marginBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['marginBalance.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      erc20BalanceNum: {
        script: {
          source:
            "if (doc['erc20Balance.keyword'].size() == 0) {\n    return 0;\n} else {\n    return Double.parseDouble(doc['erc20Balance.keyword'].value);\n}",
          lang: 'painless',
        },
      },
      partyBAllocatedBalanceNum: {
        script: {
          source:
            "if (doc['totalPartyBAllocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['totalPartyBAllocatedBalance.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      totalPartyBUnPnl: {
        script: {
          source:
            "if (doc['totalPartyBUpnl.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['totalPartyBUpnl.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      gasPaidNum: {
        script: {
          source:
            "if (doc['gasPaid.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['gasPaid.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      volumeUSD: {
        script: {
          source:
            "if (doc['notionalValue.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['notionalValue.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      botAddress: {
        script: {
          source:
            "if (doc['address.keyword'].size() == 0) {\n    return ''\n} else if (doc['symmId.keyword'].size() == 0) { \n    return '56a-' + doc['address.keyword'].value\n} else { \n    return doc['symmId.keyword'].value + '-' + doc['address.keyword'].value\n}",
          lang: 'painless',
        },
      },
      partyBAllocatedBalanceForSymmIdNum: {
        script: {
          source:
            "if (doc['partyBAllocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBAllocatedBalance.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      partyBUPNLForSymmIdNum: {
        script: {
          source:
            "if (doc['partyBUpnl.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBUpnl.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      partyBUnallocatedBalanceForSymmIdNum: {
        script: {
          source:
            "if (doc['partyBUnallocatedBalance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['partyBUnallocatedBalance.keyword'].value); // Use Double.parseDouble for floating point numbers\n}",
          lang: 'painless',
        },
      },
      gasBalanceNum: {
        script: {
          source:
            "if (doc['balance'] instanceof float) {\n    return doc['balance'].value\n} else if (doc.containsKey('balance.keyword') && doc['balance.keyword'].size() > 0) {\n    return Double.parseDouble(doc['balance.keyword'].value); // Use Double.parseDouble for floating point numbers\n} else {\n    return 0; // or any default value you prefer\n}\n",
          lang: 'painless',
        },
      },
      brokerUpnl: {
        script: {
          source:
            "if (doc['upnl.keyword'].size() == 0) { \n    return 0; \n    // or any default value you prefer \n    } else { \n        return Double.parseDouble(doc['upnl.keyword'].value); \n        // Use Double.parseDouble for floating point numbers \n    }",
          lang: 'painless',
        },
      },
    },
    stored_fields: ['*'],
    runtime_mappings: {},
    _source: {
      excludes: [],
    },
    query: {
      bool: {
        must: [],
        filter: [
          {
            bool: {
              should: [
                {
                  match: {
                    environment: env,
                  },
                },
              ],
              minimum_should_match: 1,
            },
          },
          {
            range: {
              timestamp: {
                gte: format(startDate, 'yyyy-MM-dd'),
                lte: format(endDate, 'yyyy-MM-dd'),
              },
            },
          },
        ],
        should: [],
        must_not: [],
      },
    },
  });
}
