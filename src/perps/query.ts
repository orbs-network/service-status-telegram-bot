import { format, subDays } from 'date-fns';

export const getQuery = (env: string) => {
  return JSON.stringify({
    aggs: {
      '0': {
        date_histogram: {
          field: 'timestamp',
          calendar_interval: '1d',
          time_zone: 'Europe/London',
        },
        aggs: {
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
                          "if (doc['erc20Balance.keyword'].size() == 0) { return 0; \n// or any default value you prefer \n} else { return Double.parseDouble(doc['erc20Balance.keyword'].value); \n// Use Double.parseDouble for floating point numbers \n}\n",
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
                  fields: [
                    {
                      field: 'upnl.keyword',
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
        field: 'cloudWatchLogEvents.timestamp',
        format: 'date_time',
      },
      {
        field: 'timestamp',
        format: 'date_time',
      },
    ],
    script_fields: {
      gasPaid: {
        script: {
          source:
            "if (doc['gasPaid.keyword'].size() == 0) { \n    return 0; // or any default value you prefer\n} else {\n    return Double.parseDouble(doc['gasPaid.keyword'].value); \n    // Use Double.parseDouble for floating point numbers\n}",
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
            "if (doc['erc20Balance.keyword'].size() == 0) { return 0; \n// or any default value you prefer \n} else { return Double.parseDouble(doc['erc20Balance.keyword'].value); \n// Use Double.parseDouble for floating point numbers \n}\n",
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
      gasBalanceNum: {
        script: {
          source:
            "if (doc['balance.keyword'].size() == 0) { \n    return 0; // or any default value you prefer \n} else { \n    return Double.parseDouble(doc['balance.keyword'].value); // Use Double.parseDouble for floating point numbers \n}",
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
              'cloudWatchLogEvents.timestamp': {
                format: 'dd/MM/yyyy',
                gte: format(subDays(new Date(), 1), 'dd/MM/yyyy'),
                lte: format(new Date(), 'dd/MM/yyyy'),
              },
            },
          },
        ],
        should: [],
        must_not: [],
      },
    },
  });
};
