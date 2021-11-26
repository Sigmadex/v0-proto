# Sigmadex Bug Bounty

## Overview

Starting on January 1, 2021, the [v0-proto](https://github.com/sigmadex/v0-proto) repository will welcome the community
subject to the Sigmadex Bug Bounty (the “Program”) to incentivize important bug findings.

We are limiting the event to critical and high severity bugs, and offering a reward of up to $250,000 (two hundred fifty thousand).

## Opportunity

The core purpose of the Bug Bounty Program is limited to notable bugs that result in the loss of funds. UI bugs, spelling mistakes, etc are not subject to any type of rewards.

The following are not within the scope of the Program:

- Any contract located under [contracts/test](./contracts/test) or [contracts/lens](./contracts/lens).
- Bugs in any third party contract or platform that interacts with the Sigmadex Smart Contracts.
- Vulnerabilities already reported and/or discovered in contracts built by third parties on Sigmadex.
- Any bugs which have been reported already.

Vulnerabilities on third party sites are not considered bugs.

## Presumption

Sigmadex was developed with the following assumptions, and thus any bug must also adhere to the following assumptions
to be eligible for the bug bounty:

- The `transfer` and `transferFrom` methods of any token strictly decrease the balance of the token sender by the transfer amount and increases the balance of token recipient by the transfer amount, i.e. fee on transfer tokens are excluded.
- The token balance of an address can only change due to a call to `transfer` by the sender or `transferFrom` by an approved address, i.e. rebase tokens and interest bearing tokens are excluded.

## Comphensation

Rewards will be allocated based on the severity of the bug disclosed and will be evaluated and rewarded at the discretion of the Sigmadex team.
For critical bugs that lead to loss of user funds (more than 1% or user specified slippage tolerance),
rewards of up to $500,000 will be granted. Lower severity bugs will be rewarded at the discretion of the team.
In addition, all vulnerabilities disclosed prior to the mainnet launch date will be subject to receive higher rewards.

## Discovery

Any vulnerability or major bug discovered should be immediately reported to the following email address: [security@sigmadex.org](mailto:security@sigmadex.org).

The vulnerability must not be disclosed publicly or to any other person, entity or email address before Sigmadex has been notified, has fixed the issue, and has granted permission for public disclosure. In addition, disclosure must be made within 24 hours following discovery of the vulnerability.

A detailed report of a vulnerability increases the likelihood of a reward and may increase the reward amount. Please provide as much information about the vulnerability as possible, including:

- The conditions on which reproducing the bug is contingent.
- The steps needed to reproduce the bug or, preferably, a proof of concept.
- The potential implications of the vulnerability being abused.

Anyone who reports a unique, previously-unreported vulnerability that results in a change to the code or a configuration change and who keeps such vulnerability confidential until it has been resolved by our engineers will be recognized publicly for their contribution if they so choose.

## Qualification

To be eligible for a reward under this Program, you must:

- Discover an unreported, non-public vulnerability that would result in a loss of and/or lock on any token on Sigmadex (but not on any third party platform interacting with Sigmadex) and that is within the scope of this Program.
- Be the first to disclose the unique vulnerability to [security@sigmadex.org](mailto:security@sigmadex.org), in compliance with the disclosure requirements above.
- Provide adequate information to allow our engineering team to replicate and reproduce the vulnerability.
- Not engage in any unlawful conduct when disclosing the bug, including through extortion, threats, demands, or any other forceful tactics.
- Not exploit the vulnerability privately or publicly in any way leading to a profit.
- Make a good faith effort to avoid privacy violations, destruction of data, interruption or degradation of Sigmadex.
- Not submit a vulnerability caused by an underlying issue that is the same as an issue on which a reward has been paid under this Program.
- Not be an insider (employee or contractor) within the organization.
- Not be subject to US sanctions or reside in a US-embargoed country.
- Be at least 18 years of age or, if younger, submit your vulnerability with the consent of your parent or guardian.

## Misc

By submitting your report, you grant Sigmadex any and all rights, including intellectual property rights, needed to validate, mitigate, and disclose the vulnerability. All reward decisions, including eligibility for and amounts of the rewards and the manner in which such rewards will be paid, are made at a foundation level discretion.

The right is reserved to make modifications to the terms and conditions of this Program.
