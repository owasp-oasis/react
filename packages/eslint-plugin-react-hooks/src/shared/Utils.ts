/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Rule } from 'eslint';

const SETTINGS_KEY = 'react-hooks';
const SETTINGS_ADDITIONAL_EFFECT_HOOKS_KEY = 'additionalEffectHooks';

export function getAdditionalEffectHooksFromSettings(
  settings: Rule.RuleContext['settings'],
): RegExp | undefined {
  const additionalHooks = settings[SETTINGS_KEY]?.[SETTINGS_ADDITIONAL_EFFECT_HOOKS_KEY];
  if (additionalHooks != null && typeof additionalHooks === 'string') {
    if (additionalHooks.length > 200) {
      return undefined;
    }
    if (!isSafeRegexPattern(additionalHooks)) {
      return undefined;
    }
    return new RegExp(additionalHooks);
  }

  return undefined;
}

function isSafeRegexPattern(pattern: string): boolean {
  // Allow only characters safe for hook name matching: word chars, dots,
  // dollar signs, pipes (alternation of literals), anchors, and a restricted
  // set of bracket/quantifier characters. Reject any quantifier immediately
  // following a closing group parenthesis to prevent catastrophic backtracking
  // from quantified groups regardless of group contents.
  if (!/^[\w$.|^[\](){}\\*+?-]*$/.test(pattern)) {
    return false;
  }
  // Reject quantifier applied to any group: )*  )+  )?  ){
  if (/\)[*+?{]/.test(pattern)) {
    return false;
  }
  return true;
}
