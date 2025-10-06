import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';

const normalizeTuple = (tuple) => {
  if (!tuple) return null;
  if (!Array.isArray(tuple) || tuple.length !== 3) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Permission tuples should be [module, action, resource].');
    }
    return null;
  }
  return tuple;
};

const PermissionGate = ({ required, anyOf, allOf, fallback = null, children }) => {
  const { hasPermission, hasAnyPermission } = useAuth();

  const normalizedRequired = normalizeTuple(required);
  const normalizedAllOf = Array.isArray(allOf)
    ? allOf.map(normalizeTuple).filter(Boolean)
    : [];
  const normalizedAnyOf = Array.isArray(anyOf)
    ? anyOf.map(normalizeTuple).filter(Boolean)
    : [];

  const hasRequired = normalizedRequired ? hasPermission(...normalizedRequired) : true;
  const hasAll = normalizedAllOf.length
    ? normalizedAllOf.every((perm) => hasPermission(...perm))
    : true;
  const hasAny = normalizedAnyOf.length ? hasAnyPermission(normalizedAnyOf) : true;

  return hasRequired && hasAll && hasAny ? children : fallback;
};

PermissionGate.propTypes = {
  required: PropTypes.arrayOf(PropTypes.string),
  anyOf: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  allOf: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  fallback: PropTypes.node,
  children: PropTypes.node.isRequired,
};

export default PermissionGate;