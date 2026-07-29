const paddingMap = {
  none: '!p-0',
  sm:   '!p-4',
  md:   '!p-6',
  lg:   '!p-8',
}

export default function Card({
  children,
  className = '',
  id,
  as: Tag   = 'div',
  hover     = false,
  padding   = 'md',
  onClick,
  ...rest
}) {
  return (
    <Tag
      id={id}
      onClick={onClick}
      className={[
        'card',
        paddingMap[padding] ?? paddingMap.md,
        hover ? 'card-hover cursor-pointer' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}
